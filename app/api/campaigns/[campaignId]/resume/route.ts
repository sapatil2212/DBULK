/**
 * Campaign Resume API
 * Pre-Phase 4 - Production Hardening
 * 
 * Resumes a paused campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';

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

    if (campaign.status !== 'PAUSED') {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Only paused campaigns can be resumed'),
        { status: 400 }
      );
    }

    // Verify template is still approved
    if (campaign.template.status !== 'APPROVED') {
      return NextResponse.json(
        errorResponse('TEMPLATE_NOT_APPROVED', 'Template is no longer approved'),
        { status: 400 }
      );
    }

    // Verify WhatsApp account is still connected
    if (campaign.whatsappAccount.status !== 'CONNECTED') {
      return NextResponse.json(
        errorResponse('WHATSAPP_NOT_CONNECTED', 'WhatsApp account is not connected'),
        { status: 400 }
      );
    }

    // Check remaining queued messages
    const queuedCount = await prisma.campaignMessage.count({
      where: {
        campaignId,
        status: 'QUEUED',
      },
    });

    if (queuedCount === 0) {
      // No more messages to send, mark as completed
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return NextResponse.json(
        successResponse({
          message: 'Campaign completed - no remaining messages',
          status: 'COMPLETED',
        })
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'RUNNING' },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'CAMPAIGN_STARTED',
      entityType: 'Campaign',
      entityId: campaignId,
      ipAddress,
      userAgent,
      newValue: { action: 'RESUMED', queuedMessages: queuedCount },
    });

    return NextResponse.json(
      successResponse({
        message: 'Campaign resumed successfully',
        status: 'RUNNING',
        queuedMessages: queuedCount,
      })
    );
  } catch (error) {
    console.error('Resume campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
