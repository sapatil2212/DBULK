import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { createMessageTemplate } from '@/lib/meta';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';
import { validateTemplateVariables } from '@/lib/services/template';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { templateId } = await params;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

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

    if (template.status !== 'DRAFT') {
      return NextResponse.json(
        errorResponse('INVALID_STATUS', 'Only draft templates can be submitted'),
        { status: 400 }
      );
    }

    // Final safety guard: Validate variables before Meta submission
    const variableValidation = validateTemplateVariables(template.bodyContent);
    if (!variableValidation.valid) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', variableValidation.error || 'Invalid variable placeholders'),
        { status: 400 }
      );
    }

    // Final safety guard: Validate header TEXT length before Meta submission
    if (template.headerType === 'TEXT' && template.headerContent && template.headerContent.length > 60) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Cannot submit template: Header text exceeds Meta limit of 60 characters'),
        { status: 400 }
      );
    }

    const accessToken = decrypt(template.whatsappAccount.accessTokenEncrypted);

    const components: unknown[] = [];

    if (template.headerType && template.headerContent) {
      components.push({
        type: 'HEADER',
        format: template.headerType,
        text: template.headerType === 'TEXT' ? template.headerContent : undefined,
      });
    }

    components.push({
      type: 'BODY',
      text: template.bodyContent,
    });

    if (template.footerContent) {
      components.push({
        type: 'FOOTER',
        text: template.footerContent,
      });
    }

    if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
      // Format buttons for Meta API
      const formattedButtons = (template.buttons as Array<{ type: string; text: string; url?: string; phoneNumber?: string }>).map((btn) => {
        if (btn.type === 'URL') {
          return { type: 'URL', text: btn.text, url: btn.url };
        } else if (btn.type === 'PHONE_NUMBER') {
          return { type: 'PHONE_NUMBER', text: btn.text, phone_number: btn.phoneNumber };
        } else {
          return { type: 'QUICK_REPLY', text: btn.text };
        }
      });
      components.push({
        type: 'BUTTONS',
        buttons: formattedButtons,
      });
    }

    const result = await createMessageTemplate(
      template.whatsappAccount.wabaId,
      accessToken,
      {
        name: template.name,
        language: template.language,
        category: template.category,
        components,
      }
    );

    if (!result.success) {
      await prisma.messageTemplate.update({
        where: { id: templateId },
        data: {
          status: 'REJECTED',
          rejectionReason: result.error?.message,
        },
      });

      return NextResponse.json(
        errorResponse('TEMPLATE_SUBMISSION_FAILED', result.error?.message || 'Failed to submit template'),
        { status: 400 }
      );
    }

    await prisma.messageTemplate.update({
      where: { id: templateId },
      data: {
        status: 'PENDING',
        metaTemplateId: result.data?.id,
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'TEMPLATE_SUBMITTED',
      entityType: 'MessageTemplate',
      entityId: templateId,
      ipAddress,
      userAgent,
      newValue: { metaTemplateId: result.data?.id ?? null },
    });

    return NextResponse.json(
      successResponse({
        message: 'Template submitted for approval',
        status: 'PENDING',
        metaTemplateId: result.data?.id,
      })
    );
  } catch (error) {
    console.error('Submit template error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
