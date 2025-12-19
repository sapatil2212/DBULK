/**
 * Meta WhatsApp Webhook Handler
 * 
 * Phase 1 (Sandbox) - COMPLETE
 * Phase 3 (Campaigns) - COMPLETE
 * Pre-Phase 4 (Production Hardening) - COMPLETE
 * 
 * Features:
 * - Webhook verification (GET)
 * - X-Hub-Signature-256 validation (MANDATORY in production)
 * - Idempotent event processing
 * - Status updates processing (POST)
 * - Message event logging
 * - Campaign message tracking
 * - Conversation tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/meta';
import { trackConversation } from '@/lib/services/billing';

const APP_SECRET = process.env.META_APP_SECRET || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
        conversation?: {
          id: string;
          origin: {
            type: string;
          };
        };
        pricing?: {
          billable: boolean;
          pricing_model: string;
          category: string;
        };
        errors?: Array<{
          code: number;
          title: string;
        }>;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: string;
        text?: { body: string };
      }>;
    };
    field: string;
  }>;
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

// GET - Webhook verification (Meta requires plain text response)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';

    // CRITICAL: Signature validation is MANDATORY in production
    if (IS_PRODUCTION && !APP_SECRET) {
      console.error('META_APP_SECRET not configured in production');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (APP_SECRET && !verifyWebhookSignature(rawBody, signature, APP_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ received: true });
    }

    for (const entry of payload.entry) {
      // Generate unique event ID for idempotency
      const eventId = `${entry.id}_${Date.now()}`;

      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const { metadata, statuses } = change.value;
        const phoneNumberId = metadata.phone_number_id;

        const whatsappAccount = await prisma.whatsAppAccount.findFirst({
          where: { phoneNumberId },
        });

        if (!whatsappAccount) {
          console.warn(`WhatsApp account not found for phone number ID: ${phoneNumberId}`);
          continue;
        }

        if (statuses) {
          for (const status of statuses) {
            // Idempotency check - create unique event ID per status update
            const statusEventId = `${status.id}_${status.status}_${status.timestamp}`;

            // Check if we've already processed this exact event
            const existingWebhookEvent = await prisma.webhookEvent.findUnique({
              where: { eventId: statusEventId },
            });

            if (existingWebhookEvent) {
              // Already processed, skip
              continue;
            }

            // Record this event as processed
            await prisma.webhookEvent.create({
              data: {
                eventId: statusEventId,
                eventType: `status_${status.status}`,
                payload: status as object,
              },
            });

            const messageStatus = mapStatus(status.status);

            const existingEvent = await prisma.messageEvent.findUnique({
              where: { waMessageId: status.id },
            });

            if (existingEvent) {
              await prisma.messageEvent.update({
                where: { waMessageId: status.id },
                data: {
                  status: messageStatus,
                  timestamp: new Date(parseInt(status.timestamp) * 1000),
                  errorCode: status.errors?.[0]?.code?.toString(),
                  errorMessage: status.errors?.[0]?.title,
                  conversationId: status.conversation?.id,
                  pricingModel: status.pricing?.pricing_model,
                },
              });

              if (existingEvent.campaignId) {
                await updateCampaignStats(existingEvent.campaignId, messageStatus);
              }

              // Phase 4: Track conversation for billing
              if (status.conversation) {
                const campaignId = existingEvent.campaignId || undefined;
                
                await trackConversation({
                  metaConversationId: status.conversation.id,
                  category: mapOriginToCategory(status.conversation.origin.type),
                  recipientPhone: status.recipient_id,
                  billable: status.pricing?.billable || false,
                  openedAt: new Date(parseInt(status.timestamp) * 1000),
                  whatsappAccountId: whatsappAccount.id,
                  tenantId: whatsappAccount.tenantId,
                  campaignId,
                });

                // Legacy conversation usage tracking
                if (status.pricing?.billable) {
                  await trackConversationUsage(
                    whatsappAccount.tenantId,
                    whatsappAccount.id,
                    status.conversation.origin.type
                  );
                }
              }
            } else {
              await prisma.messageEvent.create({
                data: {
                  whatsappAccountId: whatsappAccount.id,
                  waMessageId: status.id,
                  recipientPhone: status.recipient_id,
                  status: messageStatus,
                  timestamp: new Date(parseInt(status.timestamp) * 1000),
                  errorCode: status.errors?.[0]?.code?.toString(),
                  errorMessage: status.errors?.[0]?.title,
                  conversationId: status.conversation?.id,
                  pricingModel: status.pricing?.pricing_model,
                },
              });
            }

            // Also update messageLog if exists (for test messages and sandbox validation)
            await prisma.messageLog.updateMany({
              where: { messageId: status.id },
              data: { status: messageStatus },
            });

            // Update campaign_messages status (Phase 3)
            const campaignMessage = await prisma.campaignMessage.findFirst({
              where: { metaMessageId: status.id },
            });

            if (campaignMessage) {
              await prisma.campaignMessage.update({
                where: { id: campaignMessage.id },
                data: { status: messageStatus },
              });

              // Update campaign stats based on status
              await updateCampaignStats(campaignMessage.campaignId, messageStatus);

              // Check if campaign is complete
              await checkCampaignCompletion(campaignMessage.campaignId);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to prevent Meta from retrying (we handle errors internally)
    return NextResponse.json({ received: true, error: 'Internal error logged' });
  }
}

function mapStatus(status: string): 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' {
  switch (status) {
    case 'sent':
      return 'SENT';
    case 'delivered':
      return 'DELIVERED';
    case 'read':
      return 'READ';
    case 'failed':
      return 'FAILED';
    default:
      return 'QUEUED';
  }
}

async function updateCampaignStats(campaignId: string, status: string): Promise<void> {
  const updateField: Record<string, { increment: number }> = {};

  switch (status) {
    case 'DELIVERED':
      updateField.deliveredCount = { increment: 1 };
      break;
    case 'READ':
      updateField.readCount = { increment: 1 };
      break;
    case 'FAILED':
      updateField.failedCount = { increment: 1 };
      break;
  }

  if (Object.keys(updateField).length > 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: updateField,
    });
  }
}

async function checkCampaignCompletion(campaignId: string): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status === 'COMPLETED') {
    return;
  }

  // Count remaining queued messages
  const queuedCount = await prisma.campaignMessage.count({
    where: {
      campaignId,
      status: 'QUEUED',
    },
  });

  // If no more queued messages and campaign is running, mark as completed
  if (queuedCount === 0 && campaign.status === 'RUNNING') {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}

async function trackConversationUsage(
  tenantId: string,
  whatsappAccountId: string,
  originType: string
): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const category = mapOriginToCategory(originType);

  await prisma.conversationUsage.upsert({
    where: {
      tenantId_whatsappAccountId_month_year_category: {
        tenantId,
        whatsappAccountId,
        month,
        year,
        category,
      },
    },
    update: {
      conversationCount: { increment: 1 },
    },
    create: {
      tenantId,
      whatsappAccountId,
      month,
      year,
      category,
      conversationCount: 1,
      estimatedCost: 0,
      isEstimated: true,
    },
  });
}

function mapOriginToCategory(originType: string): 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE' {
  switch (originType.toLowerCase()) {
    case 'marketing':
      return 'MARKETING';
    case 'utility':
      return 'UTILITY';
    case 'authentication':
      return 'AUTHENTICATION';
    case 'service':
    case 'user_initiated':
      return 'SERVICE';
    default:
      return 'UTILITY';
  }
}
