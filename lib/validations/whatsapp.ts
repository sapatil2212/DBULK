import { z } from 'zod';

export const connectWhatsAppSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  wabaId: z.string().min(1, 'WABA ID is required'),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  accessToken: z.string().min(1, 'Access Token is required'),
});

export const createTemplateSchema = z.object({
  whatsappAccountId: z.string().uuid('Invalid WhatsApp account ID'),
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(512)
    .regex(/^[a-z0-9_]+$/, 'Template name must be lowercase with underscores only'),
  language: z.string().default('en'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  headerType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']).optional(),
  headerContent: z.string().max(60, 'Header text must be 60 characters or less').optional(),
  bodyContent: z.string().min(1, 'Body content is required'),
  footerContent: z.string().max(60).optional(),
  buttons: z.array(z.object({
    type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER']),
    text: z.string(),
    url: z.string().optional(),
    phoneNumber: z.string().optional(),
  })).max(3).optional(),
  variables: z.array(z.object({
    index: z.number(),
    example: z.string(),
  })).optional(),
});

export const submitTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
});

export const sendTestMessageSchema = z.object({
  recipientPhone: z.string().min(5, 'Recipient phone is required'),
  templateName: z.string().min(1, 'Template name is required'),
  languageCode: z.string().min(2, 'Language code is required'),
});

export type ConnectWhatsAppInput = z.infer<typeof connectWhatsAppSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type SubmitTemplateInput = z.infer<typeof submitTemplateSchema>;
export type SendTestMessageInput = z.infer<typeof sendTestMessageSchema>;
