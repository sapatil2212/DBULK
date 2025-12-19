/**
 * Send Test Message API
 * Phase 2 - Template Lifecycle
 * 
 * Sends a test message using an approved template
 * Enforces template approval checks and sandbox safety rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { MessageStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { sendTemplateMessage } from '@/lib/meta';
import { successResponse, errorResponse, handleError, RateLimitError } from '@/lib/errors';
import { getAuthUser } from '@/lib/middleware/auth';
import { sendTestMessageSchema } from '@/lib/validations/whatsapp';
import { validateTemplateForMessaging } from '@/lib/services/template';

const TEST_MESSAGE_RATE_LIMIT_WINDOW_MS = 60_000;
const TEST_MESSAGE_RATE_LIMIT_MAX = 5;

type RateLimitState = {
  windowStart: number;
  count: number;
};

const testSendRateLimit = new Map<string, RateLimitState>();

function enforceRateLimit(key: string): void {
  const now = Date.now();
  const state = testSendRateLimit.get(key);

  if (!state || now - state.windowStart > TEST_MESSAGE_RATE_LIMIT_WINDOW_MS) {
    testSendRateLimit.set(key, { windowStart: now, count: 1 });
    return;
  }

  if (state.count >= TEST_MESSAGE_RATE_LIMIT_MAX) {
    throw new RateLimitError('Too many requests');
  }

  state.count += 1;
}

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return phone.trim();
  }

  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }

  return cleaned;
}

function mapMetaErrorToUserMessage(
  code?: number,
  message?: string,
  environment?: string
): string {
  if (code === 133010) {
    return 'Recipient number is not verified in WhatsApp sandbox';
  }

  if (code === 190) {
    return 'Please reconnect WhatsApp';
  }

  if (code === 10 || code === 200 || (message && message.toLowerCase().includes('permission'))) {
    return 'WhatsApp access invalid';
  }

  if (
    code === 4 ||
    code === 17 ||
    code === 613 ||
    (message && message.toLowerCase().includes('rate limit'))
  ) {
    return 'Too many requests';
  }

  if (environment === 'SANDBOX') {
    return 'Failed to send sandbox test message';
  }

  return 'Failed to send WhatsApp message';
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const validation = sendTestMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', validation.error.issues[0].message),
        { status: 400 }
      );
    }

    const { recipientPhone, templateName, languageCode } = validation.data;

    const whatsappAccount = await prisma.whatsAppAccount.findFirst({
      where: {
        tenantId: user.tenantId,
        status: 'CONNECTED',
        isDefault: true,
      },
    });

    if (!whatsappAccount) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'WhatsApp account not found'),
        { status: 404 }
      );
    }

    if (whatsappAccount.status !== 'CONNECTED') {
      return NextResponse.json(
        errorResponse('WHATSAPP_NOT_CONNECTED', 'WhatsApp account is not connected'),
        { status: 400 }
      );
    }

    enforceRateLimit(`${user.tenantId}:${whatsappAccount.id}`);

    const environment = whatsappAccount.environment || 'SANDBOX';

    const accessToken = decrypt(whatsappAccount.accessTokenEncrypted);
    const normalizedRecipient = normalizePhoneNumber(recipientPhone);

    // Validate template is approved before sending
    const templateValidation = await validateTemplateForMessaging(
      templateName,
      user.tenantId,
      whatsappAccount.id,
      environment
    );

    if (!templateValidation.valid) {
      return NextResponse.json(
        errorResponse('TEMPLATE_NOT_APPROVED', templateValidation.error || 'Template not approved'),
        { status: 400 }
      );
    }

    const result = await sendTemplateMessage(
      whatsappAccount.phoneNumberId,
      accessToken,
      normalizedRecipient,
      templateName,
      languageCode
    );

    if (result.success) {
      const messageId = result.data?.messages?.[0]?.id ?? null;

      await prisma.messageLog.create({
        data: {
          tenantId: user.tenantId,
          whatsappAccountId: whatsappAccount.id,
          recipientPhone: normalizedRecipient,
          templateName,
          messageId: messageId ?? undefined,
          status: MessageStatus.SENT,
          environment,
          errorMessage: null,
        },
      });

      return NextResponse.json(
        successResponse({
          message: 'Test message sent successfully',
          messageId,
        })
      );
    }

    const errorCode = result.error?.code;
    const rawErrorMessage = result.error?.message;

    const userMessage = mapMetaErrorToUserMessage(errorCode, rawErrorMessage, environment);

    await prisma.messageLog.create({
      data: {
        tenantId: user.tenantId,
        whatsappAccountId: whatsappAccount.id,
        recipientPhone: normalizedRecipient,
        templateName,
        status: MessageStatus.FAILED,
        environment,
        errorMessage: rawErrorMessage || userMessage,
      },
    });

    return NextResponse.json(
      errorResponse('WHATSAPP_SEND_FAILED', userMessage),
      { status: 400 }
    );
  } catch (error) {
    console.error('Send test WhatsApp message error:', error);

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests'),
        { status: 429 }
      );
    }

    return NextResponse.json(handleError(error), { status: 500 });
  }
}
