/**
 * Production Readiness Test Script
 * Pre-Deployment Validation
 * 
 * Tests real WhatsApp API integration end-to-end
 */

import { prisma } from '../lib/db';
import { decrypt } from '../lib/encryption';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

interface TestResult {
  production_readiness: 'PASS' | 'FAIL';
  real_waba_connected: boolean;
  template_approved: boolean;
  real_messages_delivered: boolean;
  webhooks_working: boolean;
  campaign_engine_verified: boolean;
  safe_for_deployment: boolean;
  ready_for_build_and_deploy: boolean;
  errors?: string[];
}

const META_GRAPH_API_VERSION = 'v21.0';

async function validateWABAConnection(
  wabaId: string,
  phoneNumberId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log('\n🔍 Validating WABA connection...');

    const phoneUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${phoneNumberId}`;
    const phoneResponse = await fetch(
      `${phoneUrl}?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!phoneResponse.ok) {
      const error = await phoneResponse.json();
      return { success: false, error: error.error?.message || 'Phone validation failed' };
    }

    const phoneData = await phoneResponse.json();

    const wabaUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${wabaId}`;
    const wabaResponse = await fetch(`${wabaUrl}?fields=id,name,account_review_status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!wabaResponse.ok) {
      const error = await wabaResponse.json();
      return { success: false, error: error.error?.message || 'WABA validation failed' };
    }

    const wabaData = await wabaResponse.json();

    console.log('✅ WABA Connected:');
    console.log(`   - WABA: ${wabaData.name} (${wabaData.id})`);
    console.log(`   - Phone: ${phoneData.display_phone_number}`);
    console.log(`   - Quality: ${phoneData.quality_rating || 'N/A'}`);
    console.log(`   - Limit: ${phoneData.messaging_limit_tier || 'N/A'}`);

    return { success: true, data: { phoneData, wabaData } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function checkTemplateStatus(
  wabaId: string,
  accessToken: string,
  templateName: string
): Promise<{ success: boolean; approved: boolean; error?: string }> {
  try {
    console.log(`\n🔍 Checking template status: ${templateName}...`);

    const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${wabaId}/message_templates`;
    const response = await fetch(`${url}?name=${templateName}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, approved: false, error: error.error?.message };
    }

    const data = await response.json();
    const template = data.data?.[0];

    if (!template) {
      return { success: false, approved: false, error: 'Template not found' };
    }

    const approved = template.status === 'APPROVED';
    console.log(`   Status: ${template.status}`);

    if (!approved && template.rejected_reason) {
      console.log(`   Rejection: ${template.rejected_reason}`);
    }

    return { success: true, approved };
  } catch (error: any) {
    return { success: false, approved: false, error: error.message };
  }
}

async function checkWebhookEvents(tenantId: string): Promise<boolean> {
  try {
    console.log('\n🔍 Checking webhook events...');

    const recentEvents = await prisma.webhookEvent.findMany({
      where: { processedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      take: 5,
      orderBy: { processedAt: 'desc' },
    });

    if (recentEvents.length === 0) {
      console.log('⚠️  No webhook events in last 24h');
      return false;
    }

    console.log(`✅ Found ${recentEvents.length} recent webhook events`);
    return true;
  } catch (error) {
    console.error('❌ Webhook check failed:', error);
    return false;
  }
}

async function checkCampaignEngine(tenantId: string): Promise<boolean> {
  try {
    console.log('\n🔍 Checking campaign engine...');

    const campaigns = await prisma.campaign.findMany({
      where: { tenantId },
      take: 1,
      orderBy: { createdAt: 'desc' },
    });

    if (campaigns.length === 0) {
      console.log('⚠️  No campaigns found');
      return false;
    }

    const campaign = campaigns[0];
    console.log(`✅ Campaign found: ${campaign.name} (${campaign.status})`);

    const messages = await prisma.campaignMessage.findMany({
      where: { campaignId: campaign.id },
      take: 5,
    });

    console.log(`   Messages: ${messages.length}`);
    return true;
  } catch (error) {
    console.error('❌ Campaign check failed:', error);
    return false;
  }
}

async function checkSafetyFeatures(tenantId: string): Promise<boolean> {
  try {
    console.log('\n🔍 Checking safety features...');

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { sendingEnabled: true },
    });

    const systemConfig = await prisma.systemConfig.findFirst({
      where: { key: 'GLOBAL_SENDING_ENABLED' },
    });

    console.log(`   Tenant sending: ${tenant?.sendingEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   Global sending: ${systemConfig?.value === 'true' ? 'ENABLED' : 'DISABLED'}`);

    return true;
  } catch (error) {
    console.error('❌ Safety check failed:', error);
    return false;
  }
}

async function main() {
  const errors: string[] = [];
  const result: TestResult = {
    production_readiness: 'FAIL',
    real_waba_connected: false,
    template_approved: false,
    real_messages_delivered: false,
    webhooks_working: false,
    campaign_engine_verified: false,
    safe_for_deployment: false,
    ready_for_build_and_deploy: false,
  };

  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     PRODUCTION READINESS TEST - WhatsApp SaaS Portal      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Get tenant
    const email = await question('Enter your email: ');
    const user = await prisma.user.findFirst({
      where: { email },
      select: { tenantId: true, firstName: true },
    });

    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log(`\n👤 Testing for: ${user.firstName} (Tenant: ${user.tenantId})\n`);

    // PHASE A1: WABA Connection
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PHASE A1: Real WABA Connection Validation');
    console.log('═══════════════════════════════════════════════════════════');

    const account = await prisma.whatsAppAccount.findFirst({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!account) {
      errors.push('No WhatsApp account found');
      console.error('❌ No WhatsApp account connected');
    } else {
      const accessToken = decrypt(account.accessTokenEncrypted);
      const wabaValidation = await validateWABAConnection(
        account.wabaId,
        account.phoneNumberId,
        accessToken
      );

      if (wabaValidation.success) {
        result.real_waba_connected = true;
      } else {
        errors.push(`WABA validation failed: ${wabaValidation.error}`);
      }
    }

    // PHASE A2: Webhook Check
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PHASE A2: Webhook Validation');
    console.log('═══════════════════════════════════════════════════════════');

    result.webhooks_working = await checkWebhookEvents(user.tenantId);

    // PHASE B: Template Lifecycle
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PHASE B: Template Lifecycle Validation');
    console.log('═══════════════════════════════════════════════════════════');

    const templates = await prisma.messageTemplate.findMany({
      where: { tenantId: user.tenantId, status: 'APPROVED' },
      take: 1,
    });

    if (templates.length === 0) {
      errors.push('No approved templates found');
      console.log('⚠️  No approved templates - create and submit a template first');
    } else {
      console.log(`✅ Approved template found: ${templates[0].name}`);
      result.template_approved = true;
    }

    // PHASE C & D: Campaign Engine
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PHASE C & D: Campaign Engine & Message Delivery');
    console.log('═══════════════════════════════════════════════════════════');

    result.campaign_engine_verified = await checkCampaignEngine(user.tenantId);

    const deliveredMessages = await prisma.campaignMessage.findFirst({
      where: {
        campaign: { tenantId: user.tenantId },
        status: 'DELIVERED',
      },
    });

    if (deliveredMessages) {
      console.log('✅ Real messages delivered');
      result.real_messages_delivered = true;
    } else {
      console.log('⚠️  No delivered messages found - run a campaign first');
    }

    // PHASE E: Safety Features
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('PHASE E: Safety Features Validation');
    console.log('═══════════════════════════════════════════════════════════');

    await checkSafetyFeatures(user.tenantId);

    // Final Assessment
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('FINAL ASSESSMENT');
    console.log('═══════════════════════════════════════════════════════════\n');

    result.safe_for_deployment =
      result.real_waba_connected &&
      result.template_approved &&
      result.campaign_engine_verified;

    result.ready_for_build_and_deploy =
      result.safe_for_deployment &&
      result.real_messages_delivered &&
      result.webhooks_working;

    result.production_readiness = result.ready_for_build_and_deploy ? 'PASS' : 'FAIL';

    if (errors.length > 0) {
      result.errors = errors;
    }

    console.log(JSON.stringify(result, null, 2));

    if (result.production_readiness === 'PASS') {
      console.log('\n✅ SYSTEM IS READY FOR PRODUCTION DEPLOYMENT');
    } else {
      console.log('\n❌ SYSTEM NOT READY - Fix issues above');
      if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach((err) => console.log(`  - ${err}`));
      }
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    result.errors = [error instanceof Error ? error.message : 'Unknown error'];
    console.log(JSON.stringify(result, null, 2));
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
