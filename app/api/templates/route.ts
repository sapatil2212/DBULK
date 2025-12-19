import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createTemplateSchema } from '@/lib/validations/whatsapp';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';
import { validateTemplateVariables } from '@/lib/services/template';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const {
      whatsappAccountId,
      name,
      language,
      category,
      headerType,
      headerContent,
      bodyContent,
      footerContent,
      buttons,
      variables,
    } = validation.data;

    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const whatsappAccount = await prisma.whatsAppAccount.findFirst({
      where: {
        id: whatsappAccountId,
        tenantId: user.tenantId,
      },
    });

    if (!whatsappAccount) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found'),
        { status: 404 }
      );
    }

    const existingTemplate = await prisma.messageTemplate.findUnique({
      where: {
        tenantId_name_language: {
          tenantId: user.tenantId,
          name,
          language,
        },
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        errorResponse('CONFLICT', 'A template with this name and language already exists'),
        { status: 409 }
      );
    }

    // Validate template variable numbering (Meta requires sequential {{1}}, {{2}}, etc.)
    const variableValidation = validateTemplateVariables(bodyContent);
    if (!variableValidation.valid) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', variableValidation.error || 'Invalid variable placeholders'),
        { status: 400 }
      );
    }

    // Validate header TEXT length (Meta requires ≤60 chars)
    if (headerType === 'TEXT' && headerContent && headerContent.length > 60) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Header text must be 60 characters or less'),
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId: user.tenantId,
        whatsappAccountId,
        name,
        language,
        category,
        status: 'DRAFT',
        headerType,
        headerContent,
        bodyContent,
        footerContent,
        buttons: buttons || undefined,
        variables: variables || undefined,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'TEMPLATE_CREATED',
      entityType: 'MessageTemplate',
      entityId: template.id,
      ipAddress,
      userAgent,
      newValue: { name, category, language },
    });

    return NextResponse.json(
      successResponse({
        id: template.id,
        name: template.name,
        language: template.language,
        category: template.category,
        status: template.status,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const whatsappAccountId = searchParams.get('whatsappAccountId');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (whatsappAccountId) where.whatsappAccountId = whatsappAccountId;

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
        submittedAt: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(successResponse(templates));
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
