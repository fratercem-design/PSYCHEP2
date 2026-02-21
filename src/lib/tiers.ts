export interface TierConfig {
  key: string;
  name: string;
  seal: string;
  tagline: string;
  monthlyPrice: number; // dollars
  yearlyPrice: number; // dollars
  features: string[];
  color: string;
  signalExchangePerMonth: number;
  psycheBonus: number; // monthly PSYCHE bonus
}

// The Seven Veils — membership tiers
// Price IDs are set via env vars (STRIPE_PRICE_INITIATE_MONTHLY, etc.)
export const TIERS: TierConfig[] = [
  {
    key: "initiate",
    name: "Initiate",
    seal: "\u{1F702}",
    tagline: "Committed beginner",
    monthlyPrice: 7,
    yearlyPrice: 70,
    features: [
      "Full Codex access",
      "Basic quests",
      "Signal Exchange (1/mo)",
      "Community chat",
      "100 PSYCHE/month",
    ],
    color: "text-foreground",
    signalExchangePerMonth: 1,
    psycheBonus: 100,
  },
  {
    key: "acolyte",
    name: "Acolyte",
    seal: "\u{1F704}",
    tagline: "Regular participant",
    monthlyPrice: 17,
    yearlyPrice: 170,
    features: [
      "Everything in Initiate",
      "All quests unlocked",
      "Signal Exchange (3/mo)",
      "Premium rituals",
      "250 PSYCHE/month",
    ],
    color: "text-primary",
    signalExchangePerMonth: 3,
    psycheBonus: 250,
  },
  {
    key: "seeker",
    name: "Seeker",
    seal: "\u{1F701}",
    tagline: "Contributor & builder",
    monthlyPrice: 37,
    yearlyPrice: 370,
    features: [
      "Everything in Acolyte",
      "Priority support",
      "Mentorship access",
      "Council voting",
      "500 PSYCHE/month",
    ],
    color: "text-secondary",
    signalExchangePerMonth: 5,
    psycheBonus: 500,
  },
  {
    key: "adept",
    name: "Adept",
    seal: "\u{1F703}",
    tagline: "Leader-in-training",
    monthlyPrice: 77,
    yearlyPrice: 770,
    features: [
      "Everything in Seeker",
      "1:1 monthly call",
      "Custom seal design",
      "Beta access",
      "1000 PSYCHE/month",
    ],
    color: "text-[#FFD166]",
    signalExchangePerMonth: 10,
    psycheBonus: 1000,
  },
  {
    key: "keeper",
    name: "Keeper",
    seal: "\u{1F70F}",
    tagline: "Community steward",
    monthlyPrice: 177,
    yearlyPrice: 1770,
    features: [
      "Everything in Adept",
      "Revenue share",
      "Decision-making power",
      "Unlimited Signal Exchange",
      "2000 PSYCHE/month",
    ],
    color: "text-primary",
    signalExchangePerMonth: 999,
    psycheBonus: 2000,
  },
];

// Map tier key → minimum required tier index for gating
export const TIER_ORDER = [
  "unmarked",
  "initiate",
  "acolyte",
  "seeker",
  "adept",
  "keeper",
  "architect",
];

export function tierMeetsMinimum(
  userTier: string,
  requiredTier: string,
): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier);
  const reqIdx = TIER_ORDER.indexOf(requiredTier);
  return userIdx >= reqIdx;
}

// Stripe price ID env var names follow the pattern:
// STRIPE_PRICE_{TIER}_{INTERVAL}
// e.g. STRIPE_PRICE_INITIATE_MONTHLY, STRIPE_PRICE_INITIATE_YEARLY
export function getStripePriceEnvKey(
  tier: string,
  interval: "monthly" | "yearly",
): string {
  return `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
}
