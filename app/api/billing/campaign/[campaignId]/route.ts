/**
 * Campaign Billing API
 * Phase 4 - Billing
 * 
 * Returns campaign-specific billing details
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';
import { getCampaignBilling } from '@/lib/services/billing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { campaignId } = await params;

    const billing = await getCampaignBilling(campaignId, user.tenantId);

    if (!billing) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Campaign not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(billing));
  } catch (error) {
    console.error('Get campaign billing error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
