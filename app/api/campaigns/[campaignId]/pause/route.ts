/**
 * Campaign Pause API
 * Pre-Phase 4 - Production Hardening
 * 
 * Pauses a running campaign
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
    });

    if (!campaign) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Campaign not found'),
        { status: 404 }
      );
    }

    if (campaign.status !== 'RUNNING') {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Only running campaigns can be paused'),
        { status: 400 }
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'CAMPAIGN_STARTED',
      entityType: 'Campaign',
      entityId: campaignId,
      ipAddress,
      userAgent,
      newValue: { action: 'PAUSED', previousStatus: campaign.status },
    });

    return NextResponse.json(
      successResponse({
        message: 'Campaign paused successfully',
        status: 'PAUSED',
      })
    );
  } catch (error) {
    console.error('Pause campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
