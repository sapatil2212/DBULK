/**
 * PHASE 1: SANDBOX TESTING SCRIPT
 * Tests WhatsApp Cloud API using credentials from database
 */

import { PrismaClient } from '@prisma/client';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();
const META_GRAPH_API_URL = 'https://graph.facebook.com/v22.0';
const TEST_RECIPIENT = '917745868073';

// Decrypt function (matches lib/encryption/index.ts)
function decrypt(encryptedText: string): string {
  const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key-change-in-production';
  if (!encryptedText) return '';
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

interface TestResult {
  phase: string;
  status: 'PASS' | 'FAIL';
  message_delivery: boolean;
  webhook_received: boolean;
  issues_found: string[];
  ready_for_phase_2: boolean;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PHASE 1: WHATSAPP SANDBOX TESTING');
  console.log('═══════════════════════════════════════════════════════════');

  const result: TestResult = {
    phase: 'SANDBOX_TESTING',
    status: 'FAIL',
    message_delivery: false,
    webhook_received: false,
    issues_found: [],
    ready_for_phase_2: false
  };

  try {
    // Step 1: Get WhatsApp account from database
    console.log('\n📱 STEP 1: Checking WhatsApp connection status...');
    
    const account = await prisma.whatsAppAccount.findFirst({
      where: { status: 'CONNECTED' },
      select: {
        id: true,
        name: true,
        wabaId: true,
        phoneNumberId: true,
        phoneNumber: true,
        accessTokenEncrypted: true,
        status: true,
        environment: true,
      }
    });

    if (!account) {
      result.issues_found.push('No connected WhatsApp account found in database');
      console.log('❌ No connected WhatsApp account found');
      console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
      return result;
    }

    console.log('✅ WhatsApp account found:');
    console.log(`   - Name: ${account.name}`);
    console.log(`   - Phone: ${account.phoneNumber}`);
    console.log(`   - Status: ${account.status}`);
    console.log(`   - Environment: ${account.environment || 'SANDBOX'}`);
    console.log(`   - Phone Number ID: ${account.phoneNumberId}`);

    // Decrypt access token
    let accessToken: string;
    try {
      accessToken = decrypt(account.accessTokenEncrypted);
      console.log('✅ Access token decrypted successfully');
    } catch (err) {
      result.issues_found.push('Failed to decrypt access token');
      console.log('❌ Failed to decrypt access token');
      console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
      return result;
    }

    // Step 2: Validate with Meta API
    console.log('\n🔍 STEP 2: Validating credentials with Meta API...');
    
    const validateResponse = await fetch(
      `${META_GRAPH_API_URL}/${account.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    const validateData = await validateResponse.json();
    
    if (!validateResponse.ok) {
      result.issues_found.push(`Meta API validation failed: ${validateData.error?.message}`);
      console.log(`❌ Validation failed: ${validateData.error?.message}`);
      console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
      return result;
    }
    
    console.log('✅ Meta API validation successful:');
    console.log(`   - Display Phone: ${validateData.display_phone_number}`);
    console.log(`   - Verified Name: ${validateData.verified_name}`);
    console.log(`   - Quality Rating: ${validateData.quality_rating}`);

    // Step 3: Send test message
    console.log('\n📤 STEP 3: Sending test message (hello_world)...');
    console.log(`   Recipient: ${TEST_RECIPIENT}`);
    
    const payload = {
      messaging_product: 'whatsapp',
      to: TEST_RECIPIENT,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' }
      }
    };
    
    const sendResponse = await fetch(
      `${META_GRAPH_API_URL}/${account.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    
    const sendData = await sendResponse.json();
    
    if (!sendResponse.ok) {
      const errorCode = sendData.error?.error_subcode || sendData.error?.code;
      let errorMessage = sendData.error?.message || `HTTP ${sendResponse.status}`;
      
      if (errorCode === 133010) {
        errorMessage = `Recipient ${TEST_RECIPIENT} not verified in sandbox`;
      } else if (errorCode === 190) {
        errorMessage = 'Access token expired - regenerate token';
      }
      
      result.issues_found.push(`Message send failed: [${errorCode}] ${errorMessage}`);
      console.log(`❌ Send failed: [${errorCode}] ${errorMessage}`);
      console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
      return result;
    }
    
    const messageId = sendData.messages?.[0]?.id;
    console.log('✅ Message sent successfully!');
    console.log(`   Message ID: ${messageId}`);
    result.message_delivery = true;

    // Step 4: Log to database
    console.log('\n💾 STEP 4: Logging message to database...');
    
    await prisma.messageLog.create({
      data: {
        tenantId: (await prisma.whatsAppAccount.findUnique({ where: { id: account.id } }))?.tenantId || '',
        whatsappAccountId: account.id,
        recipientPhone: TEST_RECIPIENT,
        templateName: 'hello_world',
        messageId: messageId,
        status: 'SENT',
        environment: account.environment || 'SANDBOX',
      }
    });
    console.log('✅ Message logged to database');

    // Step 5: Check webhook configuration
    console.log('\n🔔 STEP 5: Webhook validation...');
    const webhookToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    if (webhookToken) {
      console.log('✅ Webhook verify token configured');
    } else {
      console.log('⚠️  META_WEBHOOK_VERIFY_TOKEN not set');
    }
    console.log('   Note: Webhook events require public callback URL');
    console.log('   Check message_events table after message delivery');

    // Check for any existing webhook events
    const recentEvents = await prisma.messageEvent.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      where: { whatsappAccountId: account.id }
    });
    
    if (recentEvents.length > 0) {
      console.log(`✅ Found ${recentEvents.length} recent webhook events in database`);
      result.webhook_received = true;
    } else {
      console.log('⚠️  No webhook events found yet (may arrive shortly)');
    }

    // Final result
    result.status = 'PASS';
    result.ready_for_phase_2 = true;

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   FINAL RESULT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(JSON.stringify(result, null, 2));

    return result;

  } catch (error) {
    result.issues_found.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`);
    console.log(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    console.log('\nFINAL RESULT:', JSON.stringify(result, null, 2));
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

main();
