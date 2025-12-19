/**
 * Meta Pricing Seed Data
 * Phase 4 - Billing
 * 
 * Static Meta WhatsApp pricing rates by country and conversation type
 * Source: Meta WhatsApp Business API Pricing (2024)
 */

import { prisma } from '@/lib/db';

interface PricingRate {
  countryCode: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE';
  price: number;
  currency: string;
}

// Meta pricing rates (approximate, based on Meta's 2024 rate card)
const META_PRICING_RATES: PricingRate[] = [
  // India
  { countryCode: 'IN', category: 'MARKETING', price: 0.0088, currency: 'USD' },
  { countryCode: 'IN', category: 'UTILITY', price: 0.0042, currency: 'USD' },
  { countryCode: 'IN', category: 'AUTHENTICATION', price: 0.0037, currency: 'USD' },
  { countryCode: 'IN', category: 'SERVICE', price: 0.0042, currency: 'USD' },

  // United States
  { countryCode: 'US', category: 'MARKETING', price: 0.0165, currency: 'USD' },
  { countryCode: 'US', category: 'UTILITY', price: 0.0055, currency: 'USD' },
  { countryCode: 'US', category: 'AUTHENTICATION', price: 0.0050, currency: 'USD' },
  { countryCode: 'US', category: 'SERVICE', price: 0.0055, currency: 'USD' },

  // United Kingdom
  { countryCode: 'GB', category: 'MARKETING', price: 0.0187, currency: 'USD' },
  { countryCode: 'GB', category: 'UTILITY', price: 0.0093, currency: 'USD' },
  { countryCode: 'GB', category: 'AUTHENTICATION', price: 0.0084, currency: 'USD' },
  { countryCode: 'GB', category: 'SERVICE', price: 0.0093, currency: 'USD' },

  // UAE
  { countryCode: 'AE', category: 'MARKETING', price: 0.0900, currency: 'USD' },
  { countryCode: 'AE', category: 'UTILITY', price: 0.0450, currency: 'USD' },
  { countryCode: 'AE', category: 'AUTHENTICATION', price: 0.0405, currency: 'USD' },
  { countryCode: 'AE', category: 'SERVICE', price: 0.0450, currency: 'USD' },

  // Saudi Arabia
  { countryCode: 'SA', category: 'MARKETING', price: 0.0611, currency: 'USD' },
  { countryCode: 'SA', category: 'UTILITY', price: 0.0305, currency: 'USD' },
  { countryCode: 'SA', category: 'AUTHENTICATION', price: 0.0275, currency: 'USD' },
  { countryCode: 'SA', category: 'SERVICE', price: 0.0305, currency: 'USD' },

  // Singapore
  { countryCode: 'SG', category: 'MARKETING', price: 0.0500, currency: 'USD' },
  { countryCode: 'SG', category: 'UTILITY', price: 0.0250, currency: 'USD' },
  { countryCode: 'SG', category: 'AUTHENTICATION', price: 0.0225, currency: 'USD' },
  { countryCode: 'SG', category: 'SERVICE', price: 0.0250, currency: 'USD' },

  // Malaysia
  { countryCode: 'MY', category: 'MARKETING', price: 0.0230, currency: 'USD' },
  { countryCode: 'MY', category: 'UTILITY', price: 0.0115, currency: 'USD' },
  { countryCode: 'MY', category: 'AUTHENTICATION', price: 0.0104, currency: 'USD' },
  { countryCode: 'MY', category: 'SERVICE', price: 0.0115, currency: 'USD' },

  // Indonesia
  { countryCode: 'ID', category: 'MARKETING', price: 0.0220, currency: 'USD' },
  { countryCode: 'ID', category: 'UTILITY', price: 0.0110, currency: 'USD' },
  { countryCode: 'ID', category: 'AUTHENTICATION', price: 0.0099, currency: 'USD' },
  { countryCode: 'ID', category: 'SERVICE', price: 0.0110, currency: 'USD' },

  // Brazil
  { countryCode: 'BR', category: 'MARKETING', price: 0.0850, currency: 'USD' },
  { countryCode: 'BR', category: 'UTILITY', price: 0.0425, currency: 'USD' },
  { countryCode: 'BR', category: 'AUTHENTICATION', price: 0.0383, currency: 'USD' },
  { countryCode: 'BR', category: 'SERVICE', price: 0.0425, currency: 'USD' },

  // Mexico
  { countryCode: 'MX', category: 'MARKETING', price: 0.0270, currency: 'USD' },
  { countryCode: 'MX', category: 'UTILITY', price: 0.0135, currency: 'USD' },
  { countryCode: 'MX', category: 'AUTHENTICATION', price: 0.0122, currency: 'USD' },
  { countryCode: 'MX', category: 'SERVICE', price: 0.0135, currency: 'USD' },

  // Germany
  { countryCode: 'DE', category: 'MARKETING', price: 0.0360, currency: 'USD' },
  { countryCode: 'DE', category: 'UTILITY', price: 0.0180, currency: 'USD' },
  { countryCode: 'DE', category: 'AUTHENTICATION', price: 0.0162, currency: 'USD' },
  { countryCode: 'DE', category: 'SERVICE', price: 0.0180, currency: 'USD' },

  // France
  { countryCode: 'FR', category: 'MARKETING', price: 0.0380, currency: 'USD' },
  { countryCode: 'FR', category: 'UTILITY', price: 0.0190, currency: 'USD' },
  { countryCode: 'FR', category: 'AUTHENTICATION', price: 0.0171, currency: 'USD' },
  { countryCode: 'FR', category: 'SERVICE', price: 0.0190, currency: 'USD' },

  // Australia
  { countryCode: 'AU', category: 'MARKETING', price: 0.0420, currency: 'USD' },
  { countryCode: 'AU', category: 'UTILITY', price: 0.0210, currency: 'USD' },
  { countryCode: 'AU', category: 'AUTHENTICATION', price: 0.0189, currency: 'USD' },
  { countryCode: 'AU', category: 'SERVICE', price: 0.0210, currency: 'USD' },

  // South Africa
  { countryCode: 'ZA', category: 'MARKETING', price: 0.0300, currency: 'USD' },
  { countryCode: 'ZA', category: 'UTILITY', price: 0.0150, currency: 'USD' },
  { countryCode: 'ZA', category: 'AUTHENTICATION', price: 0.0135, currency: 'USD' },
  { countryCode: 'ZA', category: 'SERVICE', price: 0.0150, currency: 'USD' },

  // Nigeria
  { countryCode: 'NG', category: 'MARKETING', price: 0.0320, currency: 'USD' },
  { countryCode: 'NG', category: 'UTILITY', price: 0.0160, currency: 'USD' },
  { countryCode: 'NG', category: 'AUTHENTICATION', price: 0.0144, currency: 'USD' },
  { countryCode: 'NG', category: 'SERVICE', price: 0.0160, currency: 'USD' },

  // Default/Other countries
  { countryCode: 'OTHER', category: 'MARKETING', price: 0.0300, currency: 'USD' },
  { countryCode: 'OTHER', category: 'UTILITY', price: 0.0150, currency: 'USD' },
  { countryCode: 'OTHER', category: 'AUTHENTICATION', price: 0.0135, currency: 'USD' },
  { countryCode: 'OTHER', category: 'SERVICE', price: 0.0150, currency: 'USD' },
];

/**
 * Seed Meta pricing data into database
 */
export async function seedMetaPricing(): Promise<void> {
  console.log('Seeding Meta pricing data...');

  for (const rate of META_PRICING_RATES) {
    await prisma.metaPricing.upsert({
      where: {
        countryCode_category_effectiveFrom: {
          countryCode: rate.countryCode,
          category: rate.category,
          effectiveFrom: new Date('2024-01-01'),
        },
      },
      update: {
        price: rate.price,
        currency: rate.currency,
      },
      create: {
        countryCode: rate.countryCode,
        category: rate.category,
        price: rate.price,
        currency: rate.currency,
        effectiveFrom: new Date('2024-01-01'),
      },
    });
  }

  console.log(`Seeded ${META_PRICING_RATES.length} pricing rates`);
}
