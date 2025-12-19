import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleError } from '@/lib/errors';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/services/audit';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    await prisma.session.update({
      where: { id: user.sessionId },
      data: { isValid: false },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
    });

    // Create response and clear the auth cookie
    const response = NextResponse.json(
      successResponse({ message: 'Logged out successfully' })
    );
    
    // Clear the auth token cookie
    response.cookies.delete('authToken');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
