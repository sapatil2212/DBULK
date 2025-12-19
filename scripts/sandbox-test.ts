/**
 * PHASE 1: SANDBOX TESTING SCRIPT
 * Tests WhatsApp Cloud API connection and message delivery
 */

const META_GRAPH_API_URL = 'https://graph.facebook.com/v22.0';

// Sandbox test configuration (from environment or provided)
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '955445014313370';
const TEST_RECIPIENT = process.env.WHATSAPP_TEST_RECIPIENT || '917745868073';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

interface TestResult {
  phase: string;
  status: 'PASS' | 'FAIL';
  message_delivery: boolean;
  webhook_received: boolean;
  issues_found: string[];
  ready_for_phase_2: boolean;
}

async function validatePhoneNumberId(): Promise<{ success: boolean; error?: string }> {
  console.log('\n📱 STEP 1: Validating Phone Number ID...');
  
  if (!ACCESS_TOKEN) {
    return { success: false, error: 'ACCESS_TOKEN not provided in environment' };
  }
  
  try {
    const response = await fetch(
      `${META_GRAPH_API_URL}/${PHONE_NUMBER_ID}?fields=id,display_phone_number,verified_name,quality_rating`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    console.log('✅ Phone Number validated:');
    console.log(`   - ID: ${data.id}`);
    console.log(`   - Display: ${data.display_phone_number}`);
    console.log(`   - Name: ${data.verified_name}`);
    console.log(`   - Quality: ${data.quality_rating}`);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function sendTestMessage(): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('\n📤 STEP 2: Sending test message (hello_world template)...');
  
  const payload = {
    messaging_product: 'whatsapp',
    to: TEST_RECIPIENT,
    type: 'template',
    template: {
      name: 'hello_world',
      language: { code: 'en_US' }
    }
  };
  
  console.log(`   Recipient: ${TEST_RECIPIENT}`);
  console.log(`   Template: hello_world`);
  
  try {
    const response = await fetch(
      `${META_GRAPH_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorCode = data.error?.error_subcode || data.error?.code;
      let errorMessage = data.error?.message || `HTTP ${response.status}`;
      
      // Map common errors
      if (errorCode === 133010) {
        errorMessage = 'Recipient not verified in sandbox. Add test number to Meta sandbox.';
      } else if (errorCode === 190) {
        errorMessage = 'Access token expired. Regenerate token.';
      }
      
      return { success: false, error: `[${errorCode}] ${errorMessage}` };
    }
    
    const messageId = data.messages?.[0]?.id;
    console.log('✅ Message sent successfully!');
    console.log(`   Message ID: ${messageId}`);
    
    return { success: true, messageId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function runSandboxTest(): Promise<TestResult> {
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
  
  // Step 1: Validate connection
  const validationResult = await validatePhoneNumberId();
  if (!validationResult.success) {
    result.issues_found.push(`Connection validation failed: ${validationResult.error}`);
    console.log(`\n❌ STEP 1 FAILED: ${validationResult.error}`);
    return result;
  }
  
  // Step 2: Send test message
  const sendResult = await sendTestMessage();
  if (!sendResult.success) {
    result.issues_found.push(`Message send failed: ${sendResult.error}`);
    console.log(`\n❌ STEP 2 FAILED: ${sendResult.error}`);
    return result;
  }
  
  result.message_delivery = true;
  
  // Step 3: Verify delivery (message ID returned = SENT status)
  console.log('\n📊 STEP 3: Verifying delivery...');
  if (sendResult.messageId) {
    console.log('✅ Message ID received - Status: SENT');
  }
  
  // Step 4: Webhook validation (manual check required)
  console.log('\n🔔 STEP 4: Webhook validation...');
  console.log('   ⚠️  Webhook events require external callback URL');
  console.log('   ⚠️  Check database for message_events after delivery');
  result.webhook_received = false; // Cannot verify automatically without external URL
  
  // Final status
  if (result.message_delivery) {
    result.status = 'PASS';
    result.ready_for_phase_2 = true;
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   FINAL RESULT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

// Run the test
runSandboxTest().catch(console.error);
