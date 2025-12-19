/**
 * Template Service
 * Phase 2 - Template Lifecycle
 * 
 * Provides template validation and approval checking utilities
 */

import { prisma } from '@/lib/db';

export interface TemplateValidationResult {
  valid: boolean;
  error?: string;
  template?: {
    id: string;
    name: string;
    language: string;
    category: string;
    status: string;
  };
}

/**
 * Validates that a template is approved and can be used for messaging
 * Enforces sandbox safety rules
 */
export async function validateTemplateForMessaging(
  templateName: string,
  tenantId: string,
  whatsappAccountId: string,
  environment: string
): Promise<TemplateValidationResult> {
  // Sandbox: hello_world is always allowed
  if (environment === 'SANDBOX' && templateName === 'hello_world') {
    return {
      valid: true,
      template: {
        id: 'sandbox_hello_world',
        name: 'hello_world',
        language: 'en_US',
        category: 'UTILITY',
        status: 'APPROVED',
      },
    };
  }

  // Find template in database
  const template = await prisma.messageTemplate.findFirst({
    where: {
      name: templateName,
      tenantId,
      whatsappAccountId,
    },
    select: {
      id: true,
      name: true,
      language: true,
      category: true,
      status: true,
      rejectionReason: true,
    },
  });

  if (!template) {
    return {
      valid: false,
      error: `Template "${templateName}" not found`,
    };
  }

  // Check status
  switch (template.status) {
    case 'DRAFT':
      return {
        valid: false,
        error: 'Template is still in draft. Submit it for approval first.',
      };
    case 'PENDING':
      return {
        valid: false,
        error: 'Template is pending approval from Meta. Please wait for approval.',
      };
    case 'REJECTED':
      return {
        valid: false,
        error: `Template was rejected: ${template.rejectionReason || 'Unknown reason'}`,
      };
    case 'APPROVED':
      return {
        valid: true,
        template: {
          id: template.id,
          name: template.name,
          language: template.language,
          category: template.category,
          status: template.status,
        },
      };
    default:
      return {
        valid: false,
        error: 'Unknown template status',
      };
  }
}

/**
 * Gets all usable templates for a WhatsApp account
 * Only returns APPROVED templates + sandbox defaults
 */
export async function getUsableTemplates(
  tenantId: string,
  whatsappAccountId: string,
  environment: string
): Promise<Array<{
  id: string;
  name: string;
  language: string;
  category: string;
  isSandboxDefault?: boolean;
}>> {
  const templates = await prisma.messageTemplate.findMany({
    where: {
      tenantId,
      whatsappAccountId,
      status: 'APPROVED',
    },
    select: {
      id: true,
      name: true,
      language: true,
      category: true,
    },
  });

  const result: Array<{
    id: string;
    name: string;
    language: string;
    category: string;
    isSandboxDefault?: boolean;
  }> = templates.map((t) => ({
    id: t.id,
    name: t.name,
    language: t.language,
    category: t.category,
  }));

  // Add sandbox default template
  if (environment === 'SANDBOX') {
    result.unshift({
      id: 'sandbox_hello_world',
      name: 'hello_world',
      language: 'en_US',
      category: 'UTILITY',
      isSandboxDefault: true,
    });
  }

  return result;
}

/**
 * Validates template variable placeholders
 * Ensures {{1}}, {{2}}, etc. are sequential
 */
export function validateTemplateVariables(bodyContent: string): {
  valid: boolean;
  variableCount: number;
  error?: string;
} {
  const variablePattern = /\{\{(\d+)\}\}/g;
  const matches = [...bodyContent.matchAll(variablePattern)];
  
  if (matches.length === 0) {
    return { valid: true, variableCount: 0 };
  }

  const indices = matches.map((m) => parseInt(m[1], 10)).sort((a, b) => a - b);
  
  // Check that variables start at 1 and are sequential
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] !== i + 1) {
      return {
        valid: false,
        variableCount: 0,
        error: `Variable placeholders must be sequential starting from {{1}}. Found {{${indices[i]}}} but expected {{${i + 1}}}`,
      };
    }
  }

  return { valid: true, variableCount: indices.length };
}

/**
 * Validates template name follows Meta requirements
 */
export function validateTemplateName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Template name is required' };
  }

  if (name.length > 512) {
    return { valid: false, error: 'Template name must be 512 characters or less' };
  }

  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return {
      valid: false,
      error: 'Template name must be lowercase, start with a letter, and contain only letters, numbers, and underscores',
    };
  }

  return { valid: true };
}
