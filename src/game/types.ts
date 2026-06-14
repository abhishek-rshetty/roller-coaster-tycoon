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
  footprint: number;
  monthlyMaintenance: number;
  monthlyCapacity: number;
  familyAppeal: number;
  thrillAppeal: number;
  touristAppeal: number;
  excitement: number;
  baseAttraction: number;
};

export type BuiltRide = RideDefinition & {
  instanceId: string;
  builtMonth: number;
};

export type MonthlyReport = {
  month: number;
  visitors: number;
  ticketRevenue: number;
  inParkRevenue: number;
  totalRevenue: number;
  maintenanceCost: number;
  loanInterest: number;
  netProfit: number;
  cash: number;
  debt: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  landUsed: number;
  landCapacity: number;
  messages: string[];
};

export type GameState = {
  selectedLocation: Location;
  month: number;
  cash: number;
  debt: number;
  maxDebt: number;
  annualInterestRate: number;
  ticketPrice: number;
  landUsed: number;
  landCapacity: number;
  reputation: number;
  satisfaction: number;
  rides: BuiltRide[];
  latestReport: MonthlyReport | null;
  monthlyHistory: MonthlyReport[];
};
