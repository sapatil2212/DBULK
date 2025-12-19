/**
 * Template Edit API
 * Phase 2 - Template Lifecycle
 * 
 * Allows editing of DRAFT or REJECTED templates for resubmission
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';
import { validateTemplateVariables } from '@/lib/services/template';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9_]*$/, 'Name must be lowercase snake_case starting with a letter').optional(),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']).optional(),
  language: z.string().min(2).optional(),
  headerType: z.enum(['TEXT', 'NONE']).nullable().optional(),
  headerContent: z.string().nullable().optional(),
  bodyContent: z.string().min(1).optional(),
  footerContent: z.string().nullable().optional(),
  variables: z.array(z.string()).nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { templateId } = await params;
    const body = await request.json();

    const validation = updateTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
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

    // Only allow editing DRAFT or REJECTED templates
    if (template.status !== 'DRAFT' && template.status !== 'REJECTED') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Only draft or rejected templates can be edited'),
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const { name, category, language, headerType, headerContent, bodyContent, footerContent, variables } = validation.data;

    // Validate body content variables if provided
    if (bodyContent !== undefined) {
      const variableValidation = validateTemplateVariables(bodyContent);
      if (!variableValidation.valid) {
        return NextResponse.json(
          errorResponse('VALIDATION_ERROR', variableValidation.error || 'Invalid variable placeholders'),
          { status: 400 }
        );
      }
    }

    // Validate header TEXT length (Meta requires ≤60 chars)
    const effectiveHeaderType = headerType !== undefined ? headerType : template.headerType;
    const effectiveHeaderContent = headerContent !== undefined ? headerContent : template.headerContent;
    if (effectiveHeaderType === 'TEXT' && effectiveHeaderContent && effectiveHeaderContent.length > 60) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Header text must be 60 characters or less'),
        { status: 400 }
      );
    }

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (language !== undefined) updateData.language = language;
    if (headerType !== undefined) updateData.headerType = headerType;
    if (headerContent !== undefined) updateData.headerContent = headerContent;
    if (bodyContent !== undefined) updateData.bodyContent = bodyContent;
    if (footerContent !== undefined) updateData.footerContent = footerContent;
    if (variables !== undefined) updateData.variables = variables;

    // Reset to DRAFT if was REJECTED (for resubmission)
    if (template.status === 'REJECTED') {
      updateData.status = 'DRAFT';
      updateData.rejectionReason = null;
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id: templateId },
      data: updateData,
      select: {
        id: true,
        name: true,
        language: true,
        category: true,
        status: true,
        headerType: true,
        headerContent: true,
        bodyContent: true,
        footerContent: true,
        variables: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(updatedTemplate));
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
