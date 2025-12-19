import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { validateWhatsAppCredentials } from '@/lib/meta';
import { connectWhatsAppSchema } from '@/lib/validations/whatsapp';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('WhatsApp connect API called');
    const user = await getAuthUser(request);
    console.log('User authenticated:', user.userId);
    
    const body = await request.json();
    console.log('Request body received:', { name: body.name, wabaId: body.wabaId, phoneNumberId: body.phoneNumberId, hasToken: !!body.accessToken });
    
    const validation = connectWhatsAppSchema.safeParse(body);

    if (!validation.success) {
      console.log('Validation failed:', validation.error.issues);
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { name, wabaId, phoneNumberId, accessToken } = validation.data;
    console.log('Validation passed, validating with Meta API...');
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const existingAccount = await prisma.whatsAppAccount.findUnique({
      where: {
        tenantId_phoneNumberId: {
          tenantId: user.tenantId,
          phoneNumberId,
        },
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        errorResponse('CONFLICT', 'This WhatsApp account is already connected'),
        { status: 409 }
      );
    }

    const validationResult = await validateWhatsAppCredentials(wabaId, phoneNumberId, accessToken);
    console.log('Meta API validation result:', validationResult.success ? 'SUCCESS' : 'FAILED');
    
    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error);
      return NextResponse.json(
        errorResponse('WHATSAPP_VALIDATION_FAILED', validationResult.error?.message || 'Failed to validate WhatsApp credentials'),
        { status: 400 }
      );
    }
    
    console.log('Creating WhatsApp account in database...');

    const encryptedToken = encrypt(accessToken);

    const existingDefaultCount = await prisma.whatsAppAccount.count({
      where: {
        tenantId: user.tenantId,
        isDefault: true,
      },
    });

    const whatsappAccount = await prisma.whatsAppAccount.create({
      data: {
        tenantId: user.tenantId,
        name,
        wabaId,
        phoneNumberId,
        phoneNumber: validationResult.data!.phone.display_phone_number,
        accessTokenEncrypted: encryptedToken,
        status: 'CONNECTED',
        qualityRating: validationResult.data!.phone.quality_rating,
        lastVerifiedAt: new Date(),
        isDefault: existingDefaultCount === 0,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'WHATSAPP_CONNECTED',
      entityType: 'WhatsAppAccount',
      entityId: whatsappAccount.id,
      ipAddress,
      userAgent,
      metadata: {
        wabaId,
        phoneNumber: validationResult.data!.phone.display_phone_number,
      },
    });

    return NextResponse.json(
      successResponse({
        id: whatsappAccount.id,
        name: whatsappAccount.name,
        phoneNumber: whatsappAccount.phoneNumber,
        status: whatsappAccount.status,
        qualityRating: whatsappAccount.qualityRating,
        isDefault: whatsappAccount.isDefault,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('WhatsApp connect error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const accounts = await prisma.whatsAppAccount.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        status: true,
        qualityRating: true,
        messagingLimit: true,
        isDefault: true,
        lastVerifiedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(successResponse(accounts));
  } catch (error) {
    console.error('Get WhatsApp accounts error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
