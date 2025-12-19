/**
 * Campaign API
 * Phase 3 - Campaign Engine
 * 
 * Creates campaigns with message queue, validates templates, enforces sandbox rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCampaignSchema } from '@/lib/validations/campaign';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';
import { validateTemplateVariables } from '@/lib/services/template';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const validation = createCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { whatsappAccountId, templateId, name, description, scheduledAt, contacts } = validation.data;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const whatsappAccount = await prisma.whatsAppAccount.findFirst({
      where: {
        id: whatsappAccountId,
        tenantId: user.tenantId,
        status: 'CONNECTED',
      },
    });

    if (!whatsappAccount) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found or not connected'),
        { status: 404 }
      );
    }

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: templateId,
        tenantId: user.tenantId,
      },
    });

    if (!template) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Template not found'),
        { status: 404 }
      );
    }

    if (template.status !== 'APPROVED') {
      return NextResponse.json(
        errorResponse('TEMPLATE_NOT_APPROVED', 'Only approved templates can be used for campaigns'),
        { status: 400 }
      );
    }

    // Validate variable count matches template placeholders
    const variableValidation = validateTemplateVariables(template.bodyContent);
    const requiredVarCount = variableValidation.variableCount;

    // Validate each contact has correct number of variables
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const providedVars = contact.variables ? Object.keys(contact.variables).length : 0;
      if (requiredVarCount > 0 && providedVars < requiredVarCount) {
        return NextResponse.json(
          errorResponse(
            'VARIABLE_MISMATCH',
            `Contact at index ${i} has ${providedVars} variables but template requires ${requiredVarCount}`
          ),
          { status: 400 }
        );
      }
    }

    // Sandbox safety: limit bulk campaigns
    const environment = (whatsappAccount as { environment?: string }).environment || 'SANDBOX';
    if (environment === 'SANDBOX' && contacts.length > 5) {
      return NextResponse.json(
        errorResponse(
          'SANDBOX_LIMIT',
          'Sandbox mode limits campaigns to 5 recipients. Switch to production for bulk campaigns.'
        ),
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        tenantId: user.tenantId,
        whatsappAccountId,
        templateId,
        createdById: user.userId,
        name,
        description,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalContacts: contacts.length,
        contactsMetadata: contacts,
      },
    });

    // Queue messages in campaign_messages table (not sent yet)
    const messageQueue = contacts.map((contact) => ({
      campaignId: campaign.id,
      tenantId: user.tenantId,
      phone: contact.phone,
      payload: {
        templateName: template.name,
        languageCode: template.language,
        variables: contact.variables || {},
      },
      status: 'QUEUED' as const,
      retryCount: 0,
    }));

    await prisma.campaignMessage.createMany({
      data: messageQueue,
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'CAMPAIGN_CREATED',
      entityType: 'Campaign',
      entityId: campaign.id,
      ipAddress,
      userAgent,
      newValue: { name, totalContacts: contacts.length },
    });

    return NextResponse.json(
      successResponse({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalContacts: campaign.totalContacts,
        scheduledAt: campaign.scheduledAt,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          totalContacts: true,
          sentCount: true,
          deliveredCount: true,
          readCount: true,
          failedCount: true,
          createdAt: true,
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          whatsappAccount: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json(
      successResponse(campaigns, { page, limit, total })
    );
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
