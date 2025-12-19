import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const whatsappAccountId = searchParams.get('whatsappAccountId');

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      month,
      year,
    };

    if (whatsappAccountId) {
      where.whatsappAccountId = whatsappAccountId;
    }

    const usageData = await prisma.conversationUsage.findMany({
      where,
      include: {
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    const pricingConfigs = await prisma.pricingConfig.findMany({
      where: {
        tenantId: user.tenantId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
    });

    const usageWithEstimates = usageData.map((usage) => {
      const pricing = pricingConfigs.find(
        (p) => p.category === usage.category
      );

      const estimatedCost = pricing
        ? Number(pricing.pricePerConversation) * usage.conversationCount
        : 0;

      return {
        ...usage,
        estimatedCost,
        isEstimated: true,
        note: 'ESTIMATED - Actual costs may vary based on Meta billing',
      };
    });

    const summary = {
      totalConversations: usageWithEstimates.reduce((sum, u) => sum + u.conversationCount, 0),
      totalEstimatedCost: usageWithEstimates.reduce((sum, u) => sum + u.estimatedCost, 0),
      byCategory: {
        MARKETING: usageWithEstimates.filter(u => u.category === 'MARKETING').reduce((sum, u) => sum + u.conversationCount, 0),
        UTILITY: usageWithEstimates.filter(u => u.category === 'UTILITY').reduce((sum, u) => sum + u.conversationCount, 0),
        AUTHENTICATION: usageWithEstimates.filter(u => u.category === 'AUTHENTICATION').reduce((sum, u) => sum + u.conversationCount, 0),
        SERVICE: usageWithEstimates.filter(u => u.category === 'SERVICE').reduce((sum, u) => sum + u.conversationCount, 0),
      },
      month,
      year,
      disclaimer: 'All costs are ESTIMATED based on configured pricing. Actual Meta billing may differ.',
    };

    return NextResponse.json(
      successResponse({
        usage: usageWithEstimates,
        summary,
      })
    );
  } catch (error) {
    console.error('Get usage analytics error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
