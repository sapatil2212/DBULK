/**
 * Billing Service
 * Phase 4 - Meta-Accurate Billing
 * 
 * Handles conversation tracking, cost calculation, and ledger management
 */

import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

interface ConversationData {
  metaConversationId: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE';
  recipientPhone: string;
  billable: boolean;
  openedAt: Date;
  whatsappAccountId: string;
  tenantId: string;
  campaignId?: string;
}

/**
 * Extract country code from phone number
 */
function extractCountryCode(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Common country code patterns
  if (cleaned.startsWith('91')) return 'IN'; // India
  if (cleaned.startsWith('1')) return 'US'; // USA/Canada
  if (cleaned.startsWith('44')) return 'GB'; // UK
  if (cleaned.startsWith('971')) return 'AE'; // UAE
  if (cleaned.startsWith('966')) return 'SA'; // Saudi Arabia
  if (cleaned.startsWith('65')) return 'SG'; // Singapore
  if (cleaned.startsWith('60')) return 'MY'; // Malaysia
  if (cleaned.startsWith('62')) return 'ID'; // Indonesia
  if (cleaned.startsWith('63')) return 'PH'; // Philippines
  if (cleaned.startsWith('84')) return 'VN'; // Vietnam
  if (cleaned.startsWith('86')) return 'CN'; // China
  if (cleaned.startsWith('81')) return 'JP'; // Japan
  if (cleaned.startsWith('82')) return 'KR'; // South Korea
  if (cleaned.startsWith('61')) return 'AU'; // Australia
  if (cleaned.startsWith('64')) return 'NZ'; // New Zealand
  if (cleaned.startsWith('27')) return 'ZA'; // South Africa
  if (cleaned.startsWith('234')) return 'NG'; // Nigeria
  if (cleaned.startsWith('254')) return 'KE'; // Kenya
  if (cleaned.startsWith('55')) return 'BR'; // Brazil
  if (cleaned.startsWith('52')) return 'MX'; // Mexico
  if (cleaned.startsWith('54')) return 'AR'; // Argentina
  if (cleaned.startsWith('34')) return 'ES'; // Spain
  if (cleaned.startsWith('33')) return 'FR'; // France
  if (cleaned.startsWith('49')) return 'DE'; // Germany
  if (cleaned.startsWith('39')) return 'IT'; // Italy
  if (cleaned.startsWith('7')) return 'RU'; // Russia
  
  return 'OTHER';
}

/**
 * Get Meta pricing for a conversation
 */
async function getMetaPricing(
  countryCode: string,
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE'
): Promise<{ price: Decimal; currency: string } | null> {
  const now = new Date();
  
  const pricing = await prisma.metaPricing.findFirst({
    where: {
      countryCode,
      category,
      effectiveFrom: { lte: now },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: now } },
      ],
    },
    orderBy: { effectiveFrom: 'desc' },
  });

  if (pricing) {
    return { price: pricing.price, currency: pricing.currency };
  }

  // Fallback to 'OTHER' if specific country not found
  if (countryCode !== 'OTHER') {
    return getMetaPricing('OTHER', category);
  }

  return null;
}

/**
 * Track a conversation from webhook data
 */
export async function trackConversation(data: ConversationData): Promise<void> {
  // Check if conversation already exists (idempotency)
  const existing = await prisma.whatsAppConversation.findUnique({
    where: { metaConversationId: data.metaConversationId },
  });

  if (existing) {
    return; // Already tracked
  }

  const countryCode = extractCountryCode(data.recipientPhone);
  let cost = new Decimal(0);
  let currency = 'USD';

  // Calculate cost only if billable
  if (data.billable) {
    const pricing = await getMetaPricing(countryCode, data.category);
    if (pricing) {
      cost = pricing.price;
      currency = pricing.currency;
    }
  }

  // Create conversation record
  const conversation = await prisma.whatsAppConversation.create({
    data: {
      metaConversationId: data.metaConversationId,
      tenantId: data.tenantId,
      whatsappAccountId: data.whatsappAccountId,
      campaignId: data.campaignId,
      category: data.category,
      countryCode,
      recipientPhone: data.recipientPhone,
      openedAt: data.openedAt,
      billable: data.billable,
      cost,
      currency,
    },
  });

  // If billable, create ledger entry
  if (data.billable && cost.greaterThan(0)) {
    await createLedgerEntry(
      data.tenantId,
      'CONVERSATION',
      conversation.id,
      cost,
      currency,
      `Conversation ${data.category} - ${data.recipientPhone}`
    );
  }

  // Update campaign costs if linked
  if (data.campaignId) {
    await updateCampaignCosts(data.campaignId);
  }
}

/**
 * Create a ledger entry
 */
async function createLedgerEntry(
  tenantId: string,
  referenceType: string,
  referenceId: string,
  amount: Decimal,
  currency: string,
  description?: string
): Promise<void> {
  // Check if entry already exists (idempotency)
  const existing = await prisma.tenantLedger.findUnique({
    where: {
      referenceType_referenceId: {
        referenceType,
        referenceId,
      },
    },
  });

  if (existing) {
    return; // Already recorded
  }

  await prisma.tenantLedger.create({
    data: {
      tenantId,
      referenceType,
      referenceId,
      amount,
      currency,
      description,
    },
  });
}

/**
 * Update campaign cost aggregates
 */
async function updateCampaignCosts(campaignId: string): Promise<void> {
  const conversations = await prisma.whatsAppConversation.findMany({
    where: { campaignId },
  });

  const totalConversations = conversations.length;
  const billableConversations = conversations.filter((c) => c.billable).length;
  const totalCost = conversations.reduce(
    (sum, c) => sum.add(c.cost),
    new Decimal(0)
  );

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      totalConversations,
      billableConversations,
      totalCost,
    },
  });
}

/**
 * Get tenant billing summary
 */
export async function getTenantBillingSummary(tenantId: string) {
  const conversations = await prisma.whatsAppConversation.findMany({
    where: { tenantId },
  });

  const ledgerEntries = await prisma.tenantLedger.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const totalSpend = ledgerEntries.reduce(
    (sum, entry) => sum.add(entry.amount),
    new Decimal(0)
  );

  const conversationsByCategory = conversations.reduce(
    (acc, conv) => {
      acc[conv.category] = (acc[conv.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const billableCount = conversations.filter((c) => c.billable).length;

  return {
    totalConversations: conversations.length,
    billableConversations: billableCount,
    totalSpend: totalSpend.toFixed(6),
    currency: ledgerEntries[0]?.currency || 'USD',
    conversationsByCategory,
    recentCharges: ledgerEntries.slice(0, 10).map((entry) => ({
      id: entry.id,
      type: entry.referenceType,
      amount: entry.amount.toFixed(6),
      currency: entry.currency,
      description: entry.description,
      date: entry.createdAt,
    })),
  };
}

/**
 * Get campaign billing details
 */
export async function getCampaignBilling(campaignId: string, tenantId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, tenantId },
    include: {
      conversations: {
        orderBy: { openedAt: 'desc' },
      },
    },
  });

  if (!campaign) {
    return null;
  }

  const conversationsByCategory = campaign.conversations.reduce(
    (acc, conv) => {
      acc[conv.category] = (acc[conv.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const conversationsByCountry = campaign.conversations.reduce(
    (acc, conv) => {
      const country = conv.countryCode || 'UNKNOWN';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    totalConversations: campaign.totalConversations,
    billableConversations: campaign.billableConversations,
    totalCost: campaign.totalCost.toFixed(6),
    currency: campaign.costCurrency,
    conversationsByCategory,
    conversationsByCountry,
    conversations: campaign.conversations.map((conv) => ({
      id: conv.id,
      category: conv.category,
      countryCode: conv.countryCode,
      recipientPhone: conv.recipientPhone,
      billable: conv.billable,
      cost: conv.cost.toFixed(6),
      currency: conv.currency,
      openedAt: conv.openedAt,
    })),
  };
}
