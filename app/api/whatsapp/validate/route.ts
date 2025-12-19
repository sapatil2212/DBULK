/**
 * WhatsApp Account Validation API
 * Production Readiness - Phase A1
 * 
 * Validates real WABA credentials against Meta API
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, handleError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';

const META_GRAPH_API_VERSION = 'v21.0';

interface ValidationResult {
  valid: boolean;
  phoneNumberId: string;
  wabaId: string;
  phoneNumber: string;
  displayName?: string;
  qualityRating?: string;
  messagingLimit?: string;
  verifiedName?: string;
  codeVerificationStatus?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();

    const { wabaId, phoneNumberId, accessToken } = body;

    if (!wabaId || !phoneNumberId || !accessToken) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'WABA ID, Phone Number ID, and Access Token are required'),
        { status: 400 }
      );
    }

    // Validate phone number via Meta API
    const phoneUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${phoneNumberId}`;
    const phoneResponse = await fetch(
      `${phoneUrl}?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,messaging_limit_tier`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!phoneResponse.ok) {
      const error = await phoneResponse.json();
      return NextResponse.json(
        errorResponse(
          'META_API_ERROR',
          error.error?.message || 'Failed to validate phone number with Meta API'
        ),
        { status: 400 }
      );
    }

    const phoneData = await phoneResponse.json();

    // Validate WABA via Meta API
    const wabaUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${wabaId}`;
    const wabaResponse = await fetch(
      `${wabaUrl}?fields=id,name,account_review_status,message_template_namespace`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!wabaResponse.ok) {
      const error = await wabaResponse.json();
      return NextResponse.json(
        errorResponse(
          'META_API_ERROR',
          error.error?.message || 'Failed to validate WABA with Meta API'
        ),
        { status: 400 }
      );
    }

    const wabaData = await wabaResponse.json();

    const result: ValidationResult = {
      valid: true,
      phoneNumberId: phoneData.id,
      wabaId: wabaData.id,
      phoneNumber: phoneData.display_phone_number,
      displayName: wabaData.name,
      qualityRating: phoneData.quality_rating,
      messagingLimit: phoneData.messaging_limit_tier,
      verifiedName: phoneData.verified_name,
      codeVerificationStatus: phoneData.code_verification_status,
    };

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('WhatsApp validation error:', error);
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
