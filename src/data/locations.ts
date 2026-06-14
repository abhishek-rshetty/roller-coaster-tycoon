import type { Location } from "../game/types";

export const locations: Location[] = [
  {
    id: "oakville",
    name: "Oakville",
    description:
      "A growing town with few entertainment options. Visitors are easy to attract, but budgets are limited.",
    visibleRatings: {
      competition: 1,
      visitorSpending: 2,
      tourism: 1
    },
    population: 220000,
    touristsPerMonth: 8000,
    competitionStrength: 0.15,
    spendingPower: 0.85,
    growthRateMonthly: 0.012,
    familyShare: 0.65,
    thrillShare: 0.25,
    touristShare: 0.1
  },
  {
    id: "coast_city",
    name: "Coast City",
    description:
      "A bustling tourist hotspot. Visitors spend freely, but rival parks compete for their attention.",
    visibleRatings: {
      competition: 4,
      visitorSpending: 4,
      tourism: 5
    },
    population: 520000,
    touristsPerMonth: 130000,
    competitionStrength: 0.55,
    spendingPower: 1.35,
    growthRateMonthly: 0.004,
    familyShare: 0.35,
    thrillShare: 0.4,
    touristShare: 0.25
  }
];
