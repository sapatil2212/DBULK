import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateOTP, hashSHA256 } from '@/lib/encryption';
import { sendOTPEmail } from '@/lib/mailer';
import { signupSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getClientIP, getUserAgent } from '@/lib/middleware/auth';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, tenantName } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('CONFLICT', 'An account with this email already exists'),
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: generateSlug(tenantName),
      },
    });

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'CLIENT_ADMIN',
        status: 'PENDING',
      },
    });

    const otp = generateOTP(6);
    const otpHash = hashSHA256(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        codeHash: otpHash,
        expiresAt,
        ipAddress: getClientIP(request),
      },
    });

    await sendOTPEmail(email, otp, 'verification');

    await createAuditLog({
      tenantId: tenant.id,
      userId: user.id,
      action: 'SIGNUP',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { email },
    });

    await createAuditLog({
      tenantId: tenant.id,
      userId: user.id,
      action: 'OTP_SENT',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { type: 'EMAIL_VERIFICATION' },
    });

    return NextResponse.json(
      successResponse({
        message: 'Account created successfully. Please verify your email.',
        userId: user.id,
        email: user.email,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
