import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashSHA256 } from '@/lib/encryption';
import { verifyOTPSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getClientIP, getUserAgent } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email, otp, type } = validation.data;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'User not found'),
        { status: 404 }
      );
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        type: type,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        errorResponse('OTP_EXPIRED', 'OTP has expired or is invalid'),
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        errorResponse('OTP_MAX_ATTEMPTS', 'Maximum OTP attempts exceeded'),
        { status: 400 }
      );
    }

    const otpHash = hashSHA256(otp);

    if (otpHash !== otpRecord.codeHash) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        errorResponse('OTP_INVALID', 'Invalid OTP'),
        { status: 400 }
      );
    }

    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });

    if (type === 'EMAIL_VERIFICATION') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        },
      });
    }

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'OTP_VERIFIED',
      ipAddress,
      userAgent,
      metadata: { type },
    });

    return NextResponse.json(
      successResponse({
        message: type === 'EMAIL_VERIFICATION' 
          ? 'Email verified successfully' 
          : 'OTP verified successfully',
        verified: true,
      })
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
