/**
 * Kill-Switch Admin API
 * Pre-Phase 4 - Production Hardening
 * 
 * Manage global and tenant sending status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';
import {
  isGlobalSendingDisabled,
  setGlobalSendingStatus,
  setTenantSendingStatus,
} from '@/lib/services/safety';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    // Only SUPER_ADMIN can view kill-switch status
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Only super admins can access kill-switch settings'),
        { status: 403 }
      );
    }

    const globalDisabled = await isGlobalSendingDisabled();

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        sendingEnabled: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      successResponse({
        globalSendingDisabled: globalDisabled,
        tenants,
      })
    );
  } catch (error) {
    console.error('Get kill-switch status error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    // Only SUPER_ADMIN can modify kill-switch
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Only super admins can modify kill-switch settings'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, tenantId, enabled } = body;

    if (action === 'global') {
      await setGlobalSendingStatus(!enabled);
      return NextResponse.json(
        successResponse({
          message: enabled ? 'Global sending enabled' : 'Global sending disabled',
          globalSendingDisabled: !enabled,
        })
      );
    }

    if (action === 'tenant' && tenantId) {
      await setTenantSendingStatus(tenantId, enabled);
      return NextResponse.json(
        successResponse({
          message: enabled ? 'Tenant sending enabled' : 'Tenant sending disabled',
          tenantId,
          sendingEnabled: enabled,
        })
      );
    }

    return NextResponse.json(
      errorResponse('INVALID_REQUEST', 'Invalid action or missing parameters'),
      { status: 400 }
    );
  } catch (error) {
    console.error('Set kill-switch error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
