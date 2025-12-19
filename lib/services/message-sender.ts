import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/db';
import { sendTemplateMessage } from '@/lib/meta';
import { markJobAsProcessed } from './queue';
import { createAuditLog } from './audit';

interface JobPayload {
  phoneNumberId: string;
  recipientPhone: string;
  templateName: string;
  languageCode: string;
  variables?: Record<string, string>;
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Process a message job by sending a WhatsApp template message
 */
export async function processMessageJob(
  jobId: string,
  campaignId: string,
  payload: JobPayload
): Promise<MessageResult> {
  try {
    // Get campaign and WhatsApp account
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        whatsappAccount: true,
        template: true,
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Decrypt the access token
    const accessToken = decrypt(campaign.whatsappAccount.accessTokenEncrypted);
    
    // Format the components based on variables
    const components = formatTemplateComponents(
      campaign.template,
      payload.variables || {}
    );
    
    // Send the template message
    const result = await sendTemplateMessage(
      payload.phoneNumberId,
      accessToken,
      formatPhoneNumber(payload.recipientPhone),
      payload.templateName,
      payload.languageCode,
      components
    );

    // Update campaign metrics
    await updateCampaignMetrics(campaignId, result.success);
    
    // Update job status
    await markJobAsProcessed(
      jobId,
      result.success,
      result.success ? undefined : result.error?.message
    );
    
    // Create audit log
    await createAuditLog({
      tenantId: campaign.tenantId,
      entityType: 'CampaignJob',
      entityId: jobId,
      action: 'CAMPAIGN_STARTED', // Using valid action type
      metadata: JSON.stringify({
        status: result.success ? 'sent' : 'failed',
        recipientPhone: payload.recipientPhone,
        templateName: payload.templateName,
        messageId: result.success ? result.data?.messages[0]?.id : undefined,
        error: !result.success ? result.error : undefined,
      })
    });

    return {
      success: result.success,
      messageId: result.success ? result.data?.messages[0]?.id : undefined,
      error: result.error
    };
  } catch (error) {
    console.error('Error processing message job:', error);
    
    // Mark job as failed
    await markJobAsProcessed(
      jobId,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 500
      }
    };
  }
}

/**
 * Format template components with variables
 */
function formatTemplateComponents(
  template: any,
  variables: Record<string, string>
): any[] {
  const components: any[] = [];
  
  // Process header if exists
  if (template.headerType && template.headerContent) {
    components.push({
      type: 'header',
      parameters: getParametersFromContent(template.headerContent, variables)
    });
  }
  
  // Process body
  components.push({
    type: 'body',
    parameters: getParametersFromContent(template.bodyContent, variables)
    });
  
  // Process footer if exists
  if (template.footerContent) {
    components.push({
      type: 'footer',
      text: replaceVariables(template.footerContent, variables)
    });
  }
  
  // Process buttons if exist
  if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
    components.push({
      type: 'buttons',
      buttons: template.buttons
    });
  }
  
  return components;
}

/**
 * Extract parameters from template content
 */
function getParametersFromContent(
  content: string,
  variables: Record<string, string>
): any[] {
  const parameters: any[] = [];
  const matches = [...content.matchAll(/{{(\d+)}}/g)];
  
  for (const match of matches) {
    const varNumber = match[1];
    parameters.push({
      type: 'text',
      text: variables[`var_${varNumber}`] || `[Variable ${varNumber}]`
    });
  }
  
  return parameters;
}

/**
 * Replace variables in template content
 */
function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  const matches = [...content.matchAll(/{{(\d+)}}/g)];
  
  for (const match of matches) {
    const varNumber = match[1];
    const value = variables[`var_${varNumber}`] || `[Variable ${varNumber}]`;
    result = result.replace(`{{${varNumber}}}`, value);
  }
  
  return result;
}

/**
 * Format phone number to WhatsApp format
 */
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Ensure it starts with a plus sign if not already
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Update campaign metrics after message processing
 */
async function updateCampaignMetrics(campaignId: string, success: boolean): Promise<void> {
  const updateData: Record<string, unknown> = {};
  
  if (success) {
    updateData.sentCount = { increment: 1 };
    // Initially consider as delivered too, will be updated if delivery status changes
    updateData.deliveredCount = { increment: 1 };
  } else {
    updateData.failedCount = { increment: 1 };
  }
  
  await prisma.campaign.update({
    where: { id: campaignId },
    data: updateData
  });
}
