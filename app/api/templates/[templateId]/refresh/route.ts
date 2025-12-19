/**
 * Template Status Refresh API
 * Phase 2 - Template Lifecycle
 * 
 * Fetches current template status from Meta API and updates local DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getTemplateStatus } from '@/lib/meta';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { templateId } = await params;

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: templateId,
        tenantId: user.tenantId,
      },
      include: {
        whatsappAccount: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Template not found'),
        { status: 404 }
      );
    }

    // Only refresh templates that have been submitted
    if (template.status === 'DRAFT') {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Cannot refresh status of draft template'),
        { status: 400 }
      );
    }

    const accessToken = decrypt(template.whatsappAccount.accessTokenEncrypted);

    const result = await getTemplateStatus(
      template.whatsappAccount.wabaId,
      accessToken,
      template.name
    );

    if (!result.success) {
      return NextResponse.json(
        errorResponse('META_API_ERROR', result.error?.message || 'Failed to fetch template status'),
        { status: 400 }
      );
    }

    const metaStatus = result.data?.status?.toUpperCase();
    let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
    let rejectionReason: string | null = null;

    if (metaStatus === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (metaStatus === 'REJECTED' || metaStatus === 'DISABLED') {
      newStatus = 'REJECTED';
      rejectionReason = (result.data as { rejected_reason?: string })?.rejected_reason || 'Template was rejected by Meta';
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id: templateId },
      data: {
        status: newStatus,
        rejectionReason: rejectionReason,
        approvedAt: newStatus === 'APPROVED' ? new Date() : undefined,
      },
      select: {
        id: true,
        name: true,
        status: true,
        rejectionReason: true,
        approvedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      successResponse({
        ...updatedTemplate,
        metaStatus: result.data?.status,
      })
    );
  } catch (error) {
    console.error('Refresh template status error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
