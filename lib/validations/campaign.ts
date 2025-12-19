import { z } from 'zod';

export const createCampaignSchema = z.object({
  whatsappAccountId: z.string().uuid('Invalid WhatsApp account ID'),
  templateId: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Campaign name is required').max(200),
  description: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional(),
  contacts: z.array(z.object({
    phone: z.string().min(10, 'Invalid phone number'),
    variables: z.record(z.string(), z.string()).optional(),
  })).min(1, 'At least one contact is required'),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PAUSED', 'CANCELLED']).optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
