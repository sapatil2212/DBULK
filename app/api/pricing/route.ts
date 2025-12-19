import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser, requireRole } from '@/lib/middleware/auth';

const createPricingSchema = z.object({
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION', 'SERVICE']),
  countryCode: z.string().min(2).max(3),
  pricePerConversation: z.number().positive(),
  currency: z.string().default('USD'),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['SUPER_ADMIN', 'CLIENT_ADMIN']);
    const body = await request.json();
    const validation = createPricingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { category, countryCode, pricePerConversation, currency, effectiveFrom, effectiveTo } = validation.data;

    const pricing = await prisma.pricingConfig.create({
      data: {
        tenantId: user.tenantId,
        category,
        countryCode,
        pricePerConversation,
        currency,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
    });

    return NextResponse.json(successResponse(pricing), { status: 201 });
  } catch (error) {
    console.error('Create pricing error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const pricingConfigs = await prisma.pricingConfig.findMany({
      where: { tenantId: user.tenantId },
      orderBy: [{ category: 'asc' }, { countryCode: 'asc' }],
    });

    return NextResponse.json(successResponse(pricingConfigs));
  } catch (error) {
    console.error('Get pricing error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
