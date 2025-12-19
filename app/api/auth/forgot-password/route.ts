import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP, hashSHA256 } from '@/lib/encryption';
import { sendOTPEmail } from '@/lib/mailer';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getClientIP, getUserAgent } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        successResponse({
          message: 'If an account exists with this email, you will receive a password reset OTP',
        })
      );
    }

    await prisma.oTP.updateMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
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
        type: 'PASSWORD_RESET',
        codeHash: otpHash,
        expiresAt,
        ipAddress,
      },
    });

    await sendOTPEmail(email, otp, 'password_reset');

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'OTP_SENT',
      ipAddress,
      userAgent,
      metadata: { type: 'PASSWORD_RESET' },
    });

    return NextResponse.json(
      successResponse({
        message: 'If an account exists with this email, you will receive a password reset OTP',
      })
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
