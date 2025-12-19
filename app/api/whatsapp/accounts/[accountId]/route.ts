import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { validateWhatsAppCredentials } from '@/lib/meta';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { accountId } = await params;

    const account = await prisma.whatsAppAccount.findFirst({
      where: {
        id: accountId,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        name: true,
        wabaId: true,
        phoneNumberId: true,
        phoneNumber: true,
        status: true,
        qualityRating: true,
        messagingLimit: true,
        isDefault: true,
        lastVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(account));
  } catch (error) {
    console.error('Get WhatsApp account error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { accountId } = await params;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const account = await prisma.whatsAppAccount.findFirst({
      where: {
        id: accountId,
        tenantId: user.tenantId,
      },
    });

    if (!account) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found'),
        { status: 404 }
      );
    }

    const accessToken = decrypt(account.accessTokenEncrypted);
    const validationResult = await validateWhatsAppCredentials(
      account.wabaId,
      account.phoneNumberId,
      accessToken
    );

    if (!validationResult.success) {
      await prisma.whatsAppAccount.update({
        where: { id: accountId },
        data: { status: 'ERROR' },
      });

      return NextResponse.json(
        errorResponse('WHATSAPP_VALIDATION_FAILED', validationResult.error?.message || 'Credentials validation failed'),
        { status: 400 }
      );
    }

    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: {
        status: 'CONNECTED',
        qualityRating: validationResult.data!.phone.quality_rating,
        lastVerifiedAt: new Date(),
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'WHATSAPP_CONNECTED',
      entityType: 'WhatsAppAccount',
      entityId: accountId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      successResponse({
        message: 'WhatsApp account verified successfully',
        status: 'CONNECTED',
      })
    );
  } catch (error) {
    console.error('Verify WhatsApp account error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { accountId } = await params;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const account = await prisma.whatsAppAccount.findFirst({
      where: {
        id: accountId,
        tenantId: user.tenantId,
      },
    });

    if (!account) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found'),
        { status: 404 }
      );
    }

    await prisma.whatsAppAccount.delete({
      where: { id: accountId },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'WHATSAPP_DISCONNECTED',
      entityType: 'WhatsAppAccount',
      entityId: accountId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      successResponse({ message: 'WhatsApp account disconnected successfully' })
    );
  } catch (error) {
    console.error('Delete WhatsApp account error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
