/**
 * Approved Templates API
 * Phase 2 - Template Lifecycle
 * 
 * Returns only APPROVED templates that can be used for messaging
 * Includes sandbox safety rules for hello_world template
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const whatsappAccountId = searchParams.get('whatsappAccountId');

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      status: 'APPROVED',
    };

    if (whatsappAccountId) {
      where.whatsappAccountId = whatsappAccountId;
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        language: true,
        category: true,
        status: true,
        headerType: true,
        bodyContent: true,
        footerContent: true,
        variables: true,
        approvedAt: true,
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            environment: true,
          },
        },
      },
      orderBy: { approvedAt: 'desc' },
    });

    // For sandbox accounts, also include hello_world as a virtual approved template
    const whatsappAccounts = await prisma.whatsAppAccount.findMany({
      where: {
        tenantId: user.tenantId,
        environment: 'SANDBOX',
        ...(whatsappAccountId ? { id: whatsappAccountId } : {}),
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        environment: true,
      },
    });

    const sandboxTemplates = whatsappAccounts.map((account) => ({
      id: `sandbox_hello_world_${account.id}`,
      name: 'hello_world',
      language: 'en_US',
      category: 'UTILITY',
      status: 'APPROVED',
      headerType: null,
      bodyContent: 'Hello World',
      footerContent: null,
      variables: null,
      approvedAt: null,
      whatsappAccount: account,
      isSandboxDefault: true,
    }));

    return NextResponse.json(
      successResponse([...templates, ...sandboxTemplates])
    );
  } catch (error) {
    console.error('Get approved templates error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
