/**
 * Campaign Message Dispatcher API
 * Phase 3 - Campaign Engine
 * Pre-Phase 4 - Production Hardening
 * 
 * Processes queued messages in rate-limited batches
 * Called by cron job or manual trigger
 * 
 * Features:
 * - Adaptive rate limiting per tenant
 * - Kill-switch enforcement
 * - Idempotent message sending
 * - Throttling detection and cooldown
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { sendTemplateMessage } from '@/lib/meta';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';
import { checkSendingSafety } from '@/lib/services/safety';
import {
  getTenantRateLimit,
  recordSuccess,
  recordFailure,
  isThrottlingError,
} from '@/lib/services/rate-limiter';

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

interface MessagePayload {
  templateName: string;
  languageCode: string;
  variables: Record<string, string>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

function formatTemplateComponents(
  variables: Record<string, string>
): Array<{ type: string; parameters: Array<{ type: string; text: string }> }> {
  const parameters = Object.entries(variables)
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace('var_', ''), 10);
      const numB = parseInt(b.replace('var_', ''), 10);
      return numA - numB;
    })
    .map(([, value]) => ({
      type: 'text',
      text: value,
    }));

  if (parameters.length === 0) {
    return [];
  }

  return [
    {
      type: 'body',
      parameters,
    },
  ];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { campaignId } = await params;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId: user.tenantId,
      },
      include: {
        template: true,
        whatsappAccount: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Campaign not found'),
        { status: 404 }
      );
    }

    // Only process DRAFT or RUNNING campaigns
    if (!['DRAFT', 'RUNNING', 'QUEUED'].includes(campaign.status)) {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Campaign cannot be processed in its current state'),
        { status: 400 }
      );
    }

    if (campaign.template.status !== 'APPROVED') {
      return NextResponse.json(
        errorResponse('TEMPLATE_NOT_APPROVED', 'Template must be approved before processing'),
        { status: 400 }
      );
    }

    if (campaign.whatsappAccount.status !== 'CONNECTED') {
      return NextResponse.json(
        errorResponse('WHATSAPP_NOT_CONNECTED', 'WhatsApp account is not connected'),
        { status: 400 }
      );
    }

    // Kill-switch safety check
    const safetyCheck = await checkSendingSafety(user.tenantId, campaignId);
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        errorResponse('SENDING_DISABLED', safetyCheck.reason || 'Sending is disabled'),
        { status: 403 }
      );
    }

    // Get adaptive rate limit for tenant
    const rateLimit = await getTenantRateLimit(user.tenantId);
    
    // Check if in cooldown
    if (rateLimit.inCooldown) {
      return NextResponse.json(
        successResponse({
          message: 'Rate limit cooldown active',
          cooldownUntil: rateLimit.cooldownUntil,
          processed: 0,
        })
      );
    }

    // Sandbox safety check
    const environment = (campaign.whatsappAccount as { environment?: string }).environment || 'SANDBOX';

    // Update campaign to RUNNING
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'RUNNING',
        startedAt: campaign.startedAt || new Date(),
      },
    });

    // Fetch pending messages for this campaign
    const pendingMessages = await prisma.campaignMessage.findMany({
      where: {
        campaignId,
        status: 'QUEUED',
        retryCount: { lt: MAX_RETRIES },
      },
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    });

    if (pendingMessages.length === 0) {
      // Check if campaign is complete
      const remainingMessages = await prisma.campaignMessage.count({
        where: {
          campaignId,
          status: 'QUEUED',
        },
      });

      if (remainingMessages === 0) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        return NextResponse.json(
          successResponse({
            message: 'Campaign completed',
            status: 'COMPLETED',
            processed: 0,
          })
        );
      }

      return NextResponse.json(
        successResponse({
          message: 'No pending messages to process',
          processed: 0,
        })
      );
    }

    const accessToken = decrypt(campaign.whatsappAccount.accessTokenEncrypted);
    let successCount = 0;
    let failCount = 0;
    const delayMs = rateLimit.delayMs;

    for (const msg of pendingMessages) {
      // Re-check campaign status before each message (pause support)
      const currentCampaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      });

      if (currentCampaign?.status !== 'RUNNING') {
        break; // Campaign was paused or stopped
      }

      // Idempotency check - skip if already sent
      if (msg.metaMessageId) {
        continue;
      }

      const payload = msg.payload as unknown as MessagePayload;

      try {
        const components = formatTemplateComponents(payload.variables);

        const result = await sendTemplateMessage(
          campaign.whatsappAccount.phoneNumberId,
          accessToken,
          formatPhoneNumber(msg.phone),
          payload.templateName,
          payload.languageCode,
          components.length > 0 ? components : undefined
        );

        if (result.success && result.data?.messages?.[0]?.id) {
          await prisma.campaignMessage.update({
            where: { id: msg.id },
            data: {
              status: 'SENT',
              metaMessageId: result.data.messages[0].id,
              sentAt: new Date(),
            },
          });

          await prisma.campaign.update({
            where: { id: campaignId },
            data: {
              sentCount: { increment: 1 },
            },
          });

          // Record success for adaptive rate limiting
          await recordSuccess(user.tenantId);
          successCount++;
        } else {
          const errorCode = result.error?.code;
          const isThrottled = isThrottlingError(errorCode);

          await prisma.campaignMessage.update({
            where: { id: msg.id },
            data: {
              status: msg.retryCount + 1 >= MAX_RETRIES ? 'FAILED' : 'QUEUED',
              retryCount: { increment: 1 },
              errorMessage: result.error?.message || 'Unknown error',
            },
          });

          // Record failure for adaptive rate limiting
          await recordFailure(user.tenantId, isThrottled);

          if (isThrottled) {
            // Stop processing this batch on throttling
            break;
          }

          if (msg.retryCount + 1 >= MAX_RETRIES) {
            await prisma.campaign.update({
              where: { id: campaignId },
              data: {
                failedCount: { increment: 1 },
              },
            });
            failCount++;
          }
        }
      } catch (error) {
        await prisma.campaignMessage.update({
          where: { id: msg.id },
          data: {
            status: msg.retryCount + 1 >= MAX_RETRIES ? 'FAILED' : 'QUEUED',
            retryCount: { increment: 1 },
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        // Record failure
        await recordFailure(user.tenantId, false);

        if (msg.retryCount + 1 >= MAX_RETRIES) {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: {
              failedCount: { increment: 1 },
            },
          });
          failCount++;
        }
      }

      // Adaptive rate limiting delay between messages
      await sleep(delayMs);
    }

    // Check if more messages remain
    const remainingCount = await prisma.campaignMessage.count({
      where: {
        campaignId,
        status: 'QUEUED',
      },
    });

    // If no more messages, mark campaign as completed
    if (remainingCount === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'CAMPAIGN_STARTED',
      entityType: 'Campaign',
      entityId: campaignId,
      ipAddress,
      userAgent,
      newValue: { processed: pendingMessages.length, successCount, failCount },
    });

    return NextResponse.json(
      successResponse({
        message: 'Batch processed',
        processed: pendingMessages.length,
        successCount,
        failCount,
        remainingCount,
        status: remainingCount === 0 ? 'COMPLETED' : 'RUNNING',
      })
    );
  } catch (error) {
    console.error('Process campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
