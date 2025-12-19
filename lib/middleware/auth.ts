import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';

export async function getAuthUser(request: NextRequest): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session || !session.isValid || session.expiresAt < new Date()) {
    throw new AuthenticationError('Session expired or invalid');
  }

  return payload;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<JWTPayload> {
  const user = await getAuthUser(request);

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError('Insufficient permissions');
  }

  return user;
}

export async function requireTenantAccess(
  request: NextRequest,
  tenantId: string
): Promise<JWTPayload> {
  const user = await getAuthUser(request);

  if (user.role !== 'SUPER_ADMIN' && user.tenantId !== tenantId) {
    throw new AuthorizationError('Access denied to this tenant');
  }

  return user;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
