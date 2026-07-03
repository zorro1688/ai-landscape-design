import { ProductTier } from "@/types/subscriptions";

export const SUBSCRIPTION_TIERS: ProductTier[] = [
  {
    name: "Starter",
    id: "tier-hobby",
    productId: "prod_63JTQmsUcQrlZe94IL76fI", // $11 monthly subscription
    priceMonthly: "$11",
    description: "Perfect for individual developers and small projects.",
    features: [
      "Global authentication system",
      "Database integration",
      "Secure API routes",
      "Modern UI components",
      "Dark/Light mode",
      "Community forum access",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Business",
    id: "tier-pro",
    productId: "prod_6rOJtTwlyjsH9AVuSzh8aR", // $29 monthly subscription (测试产品)
    priceMonthly: "$29",
    description: "Ideal for growing businesses and development teams.",
    features: [
      "Everything in Starter",
      "Multi-currency payments",
      "Priority support",
      "Advanced analytics",
      "Custom branding options",
      "API usage dashboard",
    ],
    featured: true,
    discountCode: "", // Optional discount code - 临时移除
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    productId: "prod_3qPYksZMtk94wQsdkgajrJ", // $99 monthly subscription
    priceMonthly: "$99",
    description: "For large organizations with advanced requirements.",
    features: [
      "Everything in Business",
      "Dedicated account manager",
      "Custom implementation support",
      "High-volume transaction processing",
      "Advanced security features",
      "Service Level Agreement (SLA)",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];

// Cost basis: Flux Kontext Pro (the standard generation model) costs ~$0.04
// per image on Replicate. These tiers price 1 credit = 1 standard generation,
// with enough margin to cover the premium model tier (3 credits/generation)
// and payment processing fees.
//
// IMPORTANT: the productId values below are PLACEHOLDERS copied from the
// original starter kit's test Creem account. You MUST create your own
// products in your Creem dashboard and replace these IDs before going live,
// or checkout will fail / charge the wrong account.
export const CREDITS_TIERS: ProductTier[] = [
  {
    name: "Starter Pack",
    id: "tier-80-credits",
    productId: "prod_lvK6umkF3omfjGEItnpCl", // $9 one-time purchase
    priceMonthly: "$9.9",
    description: "80 credits — great for exploring a few yard ideas.",
    creditAmount: 80,
    features: [
      "80 credits for AI landscape designs",
      "~80 standard designs, or mix in premium-model designs",
      "All landscape styles unlocked",
      "No expiration date",
    ],
    featured: false,
    discountCode: "",
  },
  {
    name: "Homeowner Pack",
    id: "tier-200-credits",
    productId: "prod_5QOrsVnE4mXprz85u6kCYn", // $19 one-time purchase
    priceMonthly: "$19.9",
    description: "200 credits — the best value for redesigning your whole yard.",
    creditAmount: 200,
    features: [
      "200 credits for AI landscape designs",
      "All landscape styles unlocked",
      "High-resolution downloads",
      "Priority generation queue",
      "No expiration date",
    ],
    featured: true,
    discountCode: "",
  },
  {
    name: "Professional Pack",
    id: "tier-450-credits",
    productId: "prod_7WtehksZI5C2ycKZHcKgPR", // $39 one-time purchase
    priceMonthly: "$49.9",
    description: "450 credits — built for landscapers presenting multiple client concepts.",
    creditAmount: 450,
    features: [
      "450 credits for AI landscape designs",
      "All landscape styles unlocked",
      "High-resolution downloads",
      "Priority generation queue",
      "Priority support",
      "No expiration date",
    ],
    featured: false,
    discountCode: "",
  },
];
