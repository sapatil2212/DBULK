import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(
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
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Template not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(template));
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function DELETE(
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
    });

    if (!template) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Template not found'),
        { status: 404 }
      );
    }

    if (template.status === 'APPROVED') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Cannot delete an approved template'),
        { status: 403 }
      );
    }

    await prisma.messageTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json(
      successResponse({ message: 'Template deleted successfully' })
    );
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
