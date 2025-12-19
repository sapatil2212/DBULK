const META_GRAPH_API_URL = 'https://graph.facebook.com/v24.0';

interface MetaAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: number;
  };
}

interface WhatsAppBusinessAccount {
  id: string;
  name: string;
  currency: string;
  timezone_id: string;
  message_template_namespace: string;
}

interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
  messaging_limit?: string;
}

interface TemplateResponse {
  id: string;
  status: string;
  category: string;
}

export async function validateWhatsAppCredentials(
  wabaId: string,
  phoneNumberId: string,
  accessToken: string
): Promise<MetaAPIResponse<{ waba: WhatsAppBusinessAccount; phone: PhoneNumber }>> {
  try {
    console.log('Validating WhatsApp credentials with Meta API...');
    console.log('WABA ID:', wabaId);
    console.log('Phone Number ID:', phoneNumberId);
    console.log('Access Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    const wabaUrl = `${META_GRAPH_API_URL}/${wabaId}?fields=id,name,currency,timezone_id,message_template_namespace`;
    console.log('Fetching WABA data from:', wabaUrl);
    
    const wabaResponse = await fetch(wabaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('WABA Response status:', wabaResponse.status);

    if (!wabaResponse.ok) {
      const error = await wabaResponse.json();
      console.log('WABA validation failed:', error);
      return {
        success: false,
        error: {
          message: error.error?.message || 'Failed to validate WABA ID',
          code: wabaResponse.status,
        },
      };
    }

    const wabaData = await wabaResponse.json();
    console.log('WABA data received:', wabaData);

    const phoneUrl = `${META_GRAPH_API_URL}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`;
    console.log('Fetching phone data from:', phoneUrl);
    
    const phoneResponse = await fetch(phoneUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Phone Response status:', phoneResponse.status);

    if (!phoneResponse.ok) {
      const error = await phoneResponse.json();
      console.log('Phone validation failed:', error);
      return {
        success: false,
        error: {
          message: error.error?.message || 'Failed to validate Phone Number ID',
          code: phoneResponse.status,
        },
      };
    }

    const phoneData = await phoneResponse.json();
    console.log('Phone data received:', phoneData);

    return {
      success: true,
      data: {
        waba: wabaData,
        phone: phoneData,
      },
    };
  } catch (error) {
    console.error('Meta API validation error:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500,
      },
    };
  }
}

export async function createMessageTemplate(
  wabaId: string,
  accessToken: string,
  template: {
    name: string;
    language: string;
    category: string;
    components: unknown[];
  }
): Promise<MetaAPIResponse<TemplateResponse>> {
  try {
    const response = await fetch(
      `${META_GRAPH_API_URL}/${wabaId}/message_templates`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || 'Failed to create template',
          code: response.status,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500,
      },
    };
  }
}

export async function getTemplateStatus(
  wabaId: string,
  accessToken: string,
  templateName: string
): Promise<MetaAPIResponse<TemplateResponse>> {
  try {
    const response = await fetch(
      `${META_GRAPH_API_URL}/${wabaId}/message_templates?name=${templateName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || 'Failed to get template status',
          code: response.status,
        },
      };
    }

    if (data.data && data.data.length > 0) {
      return {
        success: true,
        data: data.data[0],
      };
    }

    return {
      success: false,
      error: {
        message: 'Template not found',
        code: 404,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500,
      },
    };
  }
}

export async function sendTemplateMessage(
  phoneNumberId: string,
  accessToken: string,
  recipientPhone: string,
  templateName: string,
  languageCode: string,
  components?: unknown[]
): Promise<MetaAPIResponse<{ messages: { id: string }[] }>> {
  try {
    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    if (components && components.length > 0) {
      (payload.template as Record<string, unknown>).components = components;
    }

    const response = await fetch(
      `${META_GRAPH_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorWrapper =
        data && typeof data === 'object' && 'error' in data ? (data as any).error : undefined;

      const errorCode: number =
        errorWrapper && typeof errorWrapper.error_subcode === 'number'
          ? errorWrapper.error_subcode
          : errorWrapper && typeof errorWrapper.code === 'number'
          ? errorWrapper.code
          : response.status;

      return {
        success: false,
        error: {
          message: errorWrapper?.message || 'Failed to send message',
          code: errorCode,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500,
      },
    };
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  return `sha256=${expectedSignature}` === signature;
}
