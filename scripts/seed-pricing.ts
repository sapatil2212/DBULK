/**
 * Seed Meta Pricing Script
 * Phase 4 - Billing
 * 
 * Seeds Meta WhatsApp pricing rates into database
 */

import { seedMetaPricing } from '../lib/services/meta-pricing';

async function main() {
  try {
    await seedMetaPricing();
    console.log('✅ Meta pricing seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing:', error);
    process.exit(1);
  }
}

main();
