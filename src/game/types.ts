export type Location = {
  id: string;
  name: string;
  description: string;
  visibleRatings: {
    competition: number;
    visitorSpending: number;
    tourism: number;
  };
  population: number;
  touristsPerMonth: number;
  competitionStrength: number;
  spendingPower: number;
  growthRateMonthly: number;
  familyShare: number;
  thrillShare: number;
  touristShare: number;
};

export type RideCategory = "family" | "thrill" | "balanced" | "premium";

export type RideDefinition = {
  id: string;
  name: string;
  category: RideCategory;
  buildCost: number;
  areaRequired: number;
  monthlyMaintenance: number;
  monthlyCapacity: number;
  familyAppeal: number;
  thrillAppeal: number;
  touristAppeal: number;
  excitement: number;
  baseAttraction: number;
};

export type PlannedRide = RideDefinition & {
  planId: string;
  plannedMonth: number;
};

export type PlannedDemolition = {
  instanceId: string;
  plannedMonth: number;
  rideName: string;
  refundValue: number;
  areaReleased: number;
};

export type BuiltRide = RideDefinition & {
  instanceId: string;
  builtMonth: number;
};

export type RidePerformanceReport = {
  instanceId: string;
  name: string;
  category: RideCategory;
  ageMonths: number;
  estimatedVisitors: number;
  utilizationRate: number;
  attractionContribution: number;
  marketFitScore: number;
  maintenanceCost: number;
  demolitionRefundValue: number;
  comment: string;
};

export type MonthlyReport = {
  month: number;
  visitors: number;
  ticketRevenue: number;
  inParkRevenue: number;
  totalRevenue: number;
  maintenanceCost: number;
  loanInterest: number;
  demolitionProceeds: number;
  netProfit: number;
  cash: number;
  debt: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  areaUsed: number;
  areaCapacity: number;
  averageGuestSpend: number;
  marketSpendingModifier: number;
  satisfactionRevenueModifier: number;
  messages: string[];
  ridePerformance: RidePerformanceReport[];
};

export type GameState = {
  selectedLocation: Location;
  month: number;
  cash: number;
  debt: number;
  maxDebt: number;
  annualInterestRate: number;
  ticketPrice: number;
  areaUsed: number;
  areaCapacity: number;
  reservedCash: number;
  reservedArea: number;
  reputation: number;
  satisfaction: number;
  activeRides: BuiltRide[];
  plannedRides: PlannedRide[];
  plannedDemolitions: PlannedDemolition[];
  latestReport: MonthlyReport | null;
  monthlyHistory: MonthlyReport[];
};
