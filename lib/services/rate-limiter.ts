/**
 * Adaptive Rate Limiter Service
 * Pre-Phase 4 - Production Hardening
 * 
 * Per-tenant rate limiting with auto-scaling based on success/failure patterns
 */

import { prisma } from '@/lib/db';

const INITIAL_RATE = 20;
const MIN_RATE = 5;
const MAX_RATE = 80;
const SCALE_UP_THRESHOLD = 50;
const SCALE_UP_INCREMENT = 10;
const COOLDOWN_DURATION_MS = 2 * 60 * 1000; // 2 minutes

interface RateLimitState {
  currentRate: number;
  successCount: number;
  failureCount: number;
  cooldownUntil: Date | null;
  inCooldown: boolean;
  delayMs: number;
}

/**
 * Get or create rate limit state for a tenant
 */
export async function getTenantRateLimit(tenantId: string): Promise<RateLimitState> {
  let rateLimit = await prisma.tenantRateLimit.findUnique({
    where: { tenantId },
  });

  if (!rateLimit) {
    rateLimit = await prisma.tenantRateLimit.create({
      data: {
        tenantId,
        currentRate: INITIAL_RATE,
        successCount: 0,
        failureCount: 0,
      },
    });
  }

  const now = new Date();
  const inCooldown = rateLimit.cooldownUntil ? rateLimit.cooldownUntil > now : false;
  const delayMs = Math.ceil(60000 / rateLimit.currentRate);

  return {
    currentRate: rateLimit.currentRate,
    successCount: rateLimit.successCount,
    failureCount: rateLimit.failureCount,
    cooldownUntil: rateLimit.cooldownUntil,
    inCooldown,
    delayMs,
  };
}

/**
 * Record a successful message send
 */
export async function recordSuccess(tenantId: string): Promise<void> {
  const rateLimit = await prisma.tenantRateLimit.findUnique({
    where: { tenantId },
  });

  if (!rateLimit) {
    await prisma.tenantRateLimit.create({
      data: {
        tenantId,
        currentRate: INITIAL_RATE,
        successCount: 1,
        failureCount: 0,
      },
    });
    return;
  }

  const newSuccessCount = rateLimit.successCount + 1;
  let newRate = rateLimit.currentRate;

  // Scale up if we hit the threshold
  if (newSuccessCount >= SCALE_UP_THRESHOLD && rateLimit.failureCount === 0) {
    newRate = Math.min(rateLimit.currentRate + SCALE_UP_INCREMENT, MAX_RATE);
    
    await prisma.tenantRateLimit.update({
      where: { tenantId },
      data: {
        currentRate: newRate,
        successCount: 0,
        failureCount: 0,
        lastUpdated: new Date(),
      },
    });
  } else {
    await prisma.tenantRateLimit.update({
      where: { tenantId },
      data: {
        successCount: newSuccessCount,
        lastUpdated: new Date(),
      },
    });
  }
}

/**
 * Record a failed message send (throttling or error)
 */
export async function recordFailure(
  tenantId: string,
  isThrottling: boolean = false
): Promise<void> {
  const rateLimit = await prisma.tenantRateLimit.findUnique({
    where: { tenantId },
  });

  if (!rateLimit) {
    await prisma.tenantRateLimit.create({
      data: {
        tenantId,
        currentRate: INITIAL_RATE,
        successCount: 0,
        failureCount: 1,
      },
    });
    return;
  }

  if (isThrottling) {
    // Throttling detected - halve the rate and enter cooldown
    const newRate = Math.max(Math.floor(rateLimit.currentRate / 2), MIN_RATE);
    const cooldownUntil = new Date(Date.now() + COOLDOWN_DURATION_MS);

    await prisma.tenantRateLimit.update({
      where: { tenantId },
      data: {
        currentRate: newRate,
        successCount: 0,
        failureCount: 0,
        cooldownUntil,
        lastUpdated: new Date(),
      },
    });
  } else {
    // Regular failure - just increment counter
    await prisma.tenantRateLimit.update({
      where: { tenantId },
      data: {
        failureCount: rateLimit.failureCount + 1,
        successCount: 0,
        lastUpdated: new Date(),
      },
    });
  }
}

/**
 * Check if a Meta API error indicates throttling
 */
export function isThrottlingError(errorCode: number | string | undefined): boolean {
  if (!errorCode) return false;
  const code = typeof errorCode === 'string' ? parseInt(errorCode, 10) : errorCode;
  
  // Meta throttling error codes
  return code === 429 || code === 130429 || code === 131048 || code === 131056;
}

/**
 * Calculate delay for next message based on current rate
 */
export function calculateDelay(currentRate: number): number {
  return Math.ceil(60000 / currentRate);
}

/**
 * Reset rate limit state for a tenant
 */
export async function resetRateLimit(tenantId: string): Promise<void> {
  await prisma.tenantRateLimit.upsert({
    where: { tenantId },
    update: {
      currentRate: INITIAL_RATE,
      successCount: 0,
      failureCount: 0,
      cooldownUntil: null,
      lastUpdated: new Date(),
    },
    create: {
      tenantId,
      currentRate: INITIAL_RATE,
      successCount: 0,
      failureCount: 0,
    },
  });
}
