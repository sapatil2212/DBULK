/**
 * Campaign Start API
 * Phase 3 - Campaign Engine
 * 
 * Starts a campaign by changing status to RUNNING
 * Messages are already queued during campaign creation
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

    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Campaign cannot be started in its current state'),
        { status: 400 }
      );
    }

    if (campaign.template.status !== 'APPROVED') {
      return NextResponse.json(
        errorResponse('TEMPLATE_NOT_APPROVED', 'Template must be approved before starting campaign'),
        { status: 400 }
      );
    }

    if (campaign.whatsappAccount.status !== 'CONNECTED') {
      return NextResponse.json(
        errorResponse('WHATSAPP_NOT_CONNECTED', 'WhatsApp account is not connected'),
        { status: 400 }
      );
    }

    // Check queued messages exist
    const queuedCount = await prisma.campaignMessage.count({
      where: {
        campaignId,
        status: 'QUEUED',
      },
    });

    if (queuedCount === 0) {
      return NextResponse.json(
        errorResponse('NO_MESSAGES', 'Campaign has no queued messages'),
        { status: 400 }
      );
    }

    // Sandbox safety check
    const environment = (campaign.whatsappAccount as { environment?: string }).environment || 'SANDBOX';
    if (environment === 'SANDBOX' && queuedCount > 5) {
      return NextResponse.json(
        errorResponse(
          'SANDBOX_LIMIT',
          'Sandbox mode limits campaigns to 5 recipients'
        ),
        { status: 400 }
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'CAMPAIGN_STARTED',
      entityType: 'Campaign',
      entityId: campaignId,
      ipAddress,
      userAgent,
      newValue: { queuedMessages: queuedCount },
    });

    return NextResponse.json(
      successResponse({
        message: 'Campaign started successfully',
        status: 'RUNNING',
        queuedMessages: queuedCount,
      })
    );
  } catch (error) {
    console.error('Start campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
