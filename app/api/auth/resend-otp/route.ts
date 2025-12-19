import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP, hashSHA256 } from '@/lib/encryption';
import { sendOTPEmail } from '@/lib/mailer';
import { resendOTPSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getClientIP, getUserAgent } from '@/lib/middleware/auth';

const RATE_LIMIT_MINUTES = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resendOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email, type } = validation.data;
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

    const recentOTP = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        type: type,
        createdAt: { gt: new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000) },
      },
    });

    if (recentOTP) {
      return NextResponse.json(
        errorResponse('RATE_LIMIT', `Please wait ${RATE_LIMIT_MINUTES} minute(s) before requesting a new OTP`),
        { status: 429 }
      );
    }

    await prisma.oTP.updateMany({
      where: {
        userId: user.id,
        type: type,
        status: 'PENDING',
      },
      data: { status: 'EXPIRED' },
    });

    const otp = generateOTP(6);
    const otpHash = hashSHA256(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        type: type,
        codeHash: otpHash,
        expiresAt,
        ipAddress,
      },
    });

    const emailType = type === 'EMAIL_VERIFICATION' ? 'verification' : 'password_reset';
    await sendOTPEmail(email, otp, emailType);

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'OTP_SENT',
      ipAddress,
      userAgent,
      metadata: { type },
    });

    return NextResponse.json(
      successResponse({
        message: 'OTP sent successfully',
      })
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
