import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateCampaignSchema } from '@/lib/validations/campaign';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { campaignId } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId: user.tenantId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            bodyContent: true,
            language: true,
          },
        },
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Campaign not found'),
        { status: 404 }
      );
    }

    // Get message stats from campaign_messages
    const messageStats = await prisma.campaignMessage.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { status: true },
    });

    const stats = {
      queued: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    for (const stat of messageStats) {
      const count = stat._count.status;
      switch (stat.status) {
        case 'QUEUED':
          stats.queued = count;
          break;
        case 'SENT':
          stats.sent = count;
          break;
        case 'DELIVERED':
          stats.delivered = count;
          break;
        case 'READ':
          stats.read = count;
          break;
        case 'FAILED':
          stats.failed = count;
          break;
      }
    }

    return NextResponse.json(
      successResponse({
        ...campaign,
        messageStats: stats,
      })
    );
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { campaignId } = await params;
    const body = await request.json();
    const validation = updateCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

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

    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Only draft or scheduled campaigns can be updated'),
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.scheduledAt) {
      updateData.scheduledAt = new Date(validation.data.scheduledAt);
      updateData.status = 'SCHEDULED';
    }
    if (validation.data.status) updateData.status = validation.data.status;

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    return NextResponse.json(successResponse(updatedCampaign));
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { campaignId } = await params;

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

    if (['RUNNING', 'COMPLETED'].includes(campaign.status)) {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Cannot delete a running or completed campaign'),
        { status: 400 }
      );
    }

    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json(
      successResponse({ message: 'Campaign deleted successfully' })
    );
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
