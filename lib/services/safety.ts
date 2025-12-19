/**
 * Safety Service
 * Pre-Phase 4 - Production Hardening
 * 
 * Kill-switches, environment safety, and sending guards
 */

import { prisma } from '@/lib/db';

const GLOBAL_SENDING_DISABLED_KEY = 'GLOBAL_SENDING_DISABLED';

interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if global sending is disabled
 */
export async function isGlobalSendingDisabled(): Promise<boolean> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: GLOBAL_SENDING_DISABLED_KEY },
    });
    return config?.value === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if tenant sending is disabled
 */
export async function isTenantSendingDisabled(tenantId: string): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { sendingEnabled: true, isActive: true },
    });
    return !tenant?.isActive || !tenant?.sendingEnabled;
  } catch {
    return true;
  }
}

/**
 * Check if campaign is in a sendable state
 */
export async function isCampaignSendable(campaignId: string): Promise<boolean> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true },
    });
    return campaign?.status === 'RUNNING';
  } catch {
    return false;
  }
}

/**
 * Comprehensive safety check before sending any message
 */
export async function checkSendingSafety(
  tenantId: string,
  campaignId: string
): Promise<SafetyCheckResult> {
  // Check global kill-switch
  if (await isGlobalSendingDisabled()) {
    return { allowed: false, reason: 'Global sending is disabled' };
  }

  // Check tenant kill-switch
  if (await isTenantSendingDisabled(tenantId)) {
    return { allowed: false, reason: 'Tenant sending is disabled' };
  }

  // Check campaign state
  if (!(await isCampaignSendable(campaignId))) {
    return { allowed: false, reason: 'Campaign is not in RUNNING state' };
  }

  return { allowed: true };
}

/**
 * Environment-specific safety checks
 */
export async function checkEnvironmentSafety(
  whatsappAccountId: string,
  recipientCount: number
): Promise<SafetyCheckResult> {
  const account = await prisma.whatsAppAccount.findUnique({
    where: { id: whatsappAccountId },
  });

  if (!account) {
    return { allowed: false, reason: 'WhatsApp account not found' };
  }

  const environment = account.environment || 'SANDBOX';

  if (environment === 'SANDBOX') {
    // Sandbox limits
    if (recipientCount > 5) {
      return { allowed: false, reason: 'Sandbox mode limits to 5 recipients' };
    }
  } else if (environment === 'PRODUCTION') {
    // Production checks
    if (account.status !== 'CONNECTED') {
      return { allowed: false, reason: 'WhatsApp account not connected' };
    }

    // Check quality rating
    const qualityRating = account.qualityRating?.toUpperCase();
    if (qualityRating === 'RED' || qualityRating === 'FLAGGED') {
      return { allowed: false, reason: 'Phone quality rating is too low' };
    }
  }

  return { allowed: true };
}

/**
 * Set global sending status
 */
export async function setGlobalSendingStatus(disabled: boolean): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: GLOBAL_SENDING_DISABLED_KEY },
    update: { value: disabled ? 'true' : 'false' },
    create: { key: GLOBAL_SENDING_DISABLED_KEY, value: disabled ? 'true' : 'false' },
  });
}

/**
 * Set tenant sending status
 */
export async function setTenantSendingStatus(
  tenantId: string,
  enabled: boolean
): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { sendingEnabled: enabled },
  });
}
