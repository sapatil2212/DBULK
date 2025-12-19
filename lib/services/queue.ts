// Queue Interface for BullMQ (Redis)
// This is a design-ready interface - actual processing happens outside Vercel

import { prisma } from '@/lib/db';

export interface QueueJob {
  id: string;
  campaignId: string;
  type: 'SEND_MESSAGE';
  payload: {
    phoneNumberId: string;
    recipientPhone: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
  };
  priority: number;
  attempts: number;
  maxAttempts: number;
}

export async function addCampaignJobsToQueue(
  campaignId: string,
  contacts: Array<{
    phone: string;
    variables?: Record<string, string>;
  }>,
  templateInfo: {
    phoneNumberId: string;
    templateName: string;
    languageCode: string;
  }
): Promise<number> {
  const jobs = contacts.map((contact, index) => ({
    campaignId,
    status: 'pending',
    payload: {
      phoneNumberId: templateInfo.phoneNumberId,
      recipientPhone: contact.phone,
      templateName: templateInfo.templateName,
      languageCode: templateInfo.languageCode,
      variables: contact.variables,
    },
    attempts: 0,
    maxAttempts: 3,
  }));

  const result = await prisma.campaignJob.createMany({
    data: jobs.map(job => ({
      ...job,
      payload: job.payload as object,
    })),
  });

  return result.count;
}

export async function getPendingJobs(limit: number = 100): Promise<QueueJob[]> {
  const jobs = await prisma.campaignJob.findMany({
    where: {
      status: 'pending',
    },
    take: limit,
    orderBy: { createdAt: 'asc' },
  });

  return jobs
    .filter((job) => job.attempts < job.maxAttempts)
    .map((job) => ({
      id: job.id,
      campaignId: job.campaignId,
      type: 'SEND_MESSAGE' as const,
      payload: job.payload as QueueJob['payload'],
      priority: 0,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
    }));
}

export async function markJobAsProcessed(
  jobId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await prisma.campaignJob.update({
    where: { id: jobId },
    data: {
      status: success ? 'completed' : 'failed',
      processedAt: new Date(),
      error: error,
      attempts: { increment: 1 },
    },
  });
}

export async function retryFailedJobs(campaignId: string): Promise<number> {
  const result = await prisma.campaignJob.updateMany({
    where: {
      campaignId,
      status: 'failed',
      attempts: { lt: 3 },
    },
    data: {
      status: 'pending',
    },
  });

  return result.count;
}
