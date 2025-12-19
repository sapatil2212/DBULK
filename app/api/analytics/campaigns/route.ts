import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const campaigns = await prisma.campaign.findMany({
      where: {
        tenantId: user.tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        name: true,
        status: true,
        totalContacts: true,
        sentCount: true,
        deliveredCount: true,
        readCount: true,
        failedCount: true,
        startedAt: true,
        completedAt: true,
      },
    });

    const totalCampaigns = campaigns.length;
    const totalMessages = campaigns.reduce((sum, c) => sum + c.totalContacts, 0);
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalRead = campaigns.reduce((sum, c) => sum + c.readCount, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
    const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

    const statusBreakdown = {
      DRAFT: campaigns.filter(c => c.status === 'DRAFT').length,
      SCHEDULED: campaigns.filter(c => c.status === 'SCHEDULED').length,
      QUEUED: campaigns.filter(c => c.status === 'QUEUED').length,
      RUNNING: campaigns.filter(c => c.status === 'RUNNING').length,
      COMPLETED: campaigns.filter(c => c.status === 'COMPLETED').length,
      FAILED: campaigns.filter(c => c.status === 'FAILED').length,
    };

    return NextResponse.json(
      successResponse({
        period: { days, startDate, endDate: new Date() },
        summary: {
          totalCampaigns,
          totalMessages,
          totalSent,
          totalDelivered,
          totalRead,
          totalFailed,
          deliveryRate: deliveryRate.toFixed(2),
          readRate: readRate.toFixed(2),
          failureRate: failureRate.toFixed(2),
        },
        statusBreakdown,
        campaigns,
      })
    );
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
