import type { Location } from "../game/types";

export const locations: Location[] = [
  {
    id: "indore",
    name: "Indore",
    description:
      "A fast-growing Tier-2 city with strong family demand and moderate spending. Good for steady, value-driven park growth.",
    visibleRatings: {
      competition: 2,
      visitorSpending: 2,
      tourism: 2
    },
    population: 320000,
    touristsPerMonth: 18000,
    competitionStrength: 0.2,
    spendingPower: 0.85,
    growthRateMonthly: 0.01,
    familyShare: 0.6,
    thrillShare: 0.25,
    touristShare: 0.15
  },
  {
    id: "goa",
    name: "Goa",
    description:
      "A high-tourism destination with stronger spending and heavier competition. Premium attractions can do well if the park stays differentiated.",
    visibleRatings: {
      competition: 4,
      visitorSpending: 4,
      tourism: 5
    },
    population: 180000,
    touristsPerMonth: 140000,
    competitionStrength: 0.55,
    spendingPower: 1.35,
    growthRateMonthly: 0.004,
    familyShare: 0.3,
    thrillShare: 0.35,
    touristShare: 0.35
  }
];
