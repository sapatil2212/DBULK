/**
 * Billing Summary API
 * Phase 4 - Billing
 * 
 * Returns tenant billing summary with conversation breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';
import { getTenantBillingSummary } from '@/lib/services/billing';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const summary = await getTenantBillingSummary(user.tenantId);

    return NextResponse.json(successResponse(summary));
  } catch (error) {
    console.error('Get billing summary error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
