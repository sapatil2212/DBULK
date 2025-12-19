import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { signToken, getTokenExpiry } from '@/lib/auth/jwt';
import { generateSecureToken } from '@/lib/encryption';
import { sendSecurityAlertEmail } from '@/lib/mailer';
import { loginSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { createAuditLog } from '@/lib/services/audit';
import { getClientIP, getUserAgent } from '@/lib/middleware/auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('AUTHENTICATION_ERROR', 'Invalid email or password'),
        { status: 401 }
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        errorResponse(
          'ACCOUNT_LOCKED',
          `Account is locked. Try again in ${remainingMinutes} minutes.`
        ),
        { status: 423 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      const newFailedCount = user.failedLoginCount + 1;
      const updateData: { failedLoginCount: number; lockedUntil?: Date } = {
        failedLoginCount: newFailedCount,
      };

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return NextResponse.json(
        errorResponse('AUTHENTICATION_ERROR', 'Invalid email or password'),
        { status: 401 }
      );
    }

    if (user.status === 'PENDING') {
      return NextResponse.json(
        errorResponse('EMAIL_NOT_VERIFIED', 'Please verify your email first'),
        { status: 403 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        errorResponse('ACCOUNT_SUSPENDED', 'Your account has been suspended'),
        { status: 403 }
      );
    }

    if (!user.tenant.isActive) {
      return NextResponse.json(
        errorResponse('TENANT_INACTIVE', 'Your organization account is inactive'),
        { status: 403 }
      );
    }

    const sessionToken = generateSecureToken(64);
    const expiresAt = getTokenExpiry();

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const jwt = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail(user.email, 'login', ipAddress, userAgent);

    // Create response with user data including the token for client-side access
    const response = NextResponse.json(
      successResponse({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant.name,
        },
        token: jwt, // Include token in response body for client-side access
      })
    );

    // Set the auth token in two cookies:
    // 1. HTTP-only cookie for security with API requests
    response.cookies.set({
      name: 'authToken',
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    // 2. Regular cookie for JavaScript access
    response.cookies.set({
      name: 'auth_token',
      value: jwt,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
