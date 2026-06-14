import { clamp } from "../utils/math";
import type {
  BuiltRide,
  GameState,
  MonthlyReport,
  RideDefinition,
  RidePerformanceReport
} from "./types";

type RideInsight = {
  ride: BuiltRide;
  marketFit: number;
  rideAttraction: number;
  duplicateMultiplier: number;
  adjustedAttraction: number;
};

type SimulationSnapshot = {
  rawMarketDemand: number;
  totalAttraction: number;
  totalRideCapacity: number;
  visitors: number;
  ticketRevenue: number;
  averageGuestSpend: number;
  inParkRevenue: number;
  totalRevenue: number;
  maintenanceCost: number;
  loanInterest: number;
  netProfit: number;
  cash: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  marketSpendingModifier: number;
  satisfactionRevenueModifier: number;
  messages: string[];
  ridePerformance: RidePerformanceReport[];
};

export function getMarketFit(ride: RideDefinition, state: GameState): number {
  return (
    ride.familyAppeal * state.selectedLocation.familyShare +
    ride.thrillAppeal * state.selectedLocation.thrillShare +
    ride.touristAppeal * state.selectedLocation.touristShare
  );
}

export function getDuplicateMultiplier(duplicateIndex: number): number {
  return Math.max(0.4, 1 - duplicateIndex * 0.2);
}

function buildRideInsights(state: GameState): RideInsight[] {
  const duplicateCounts = new Map<string, number>();

  return state.activeRides.map((ride) => {
    const seenCount = duplicateCounts.get(ride.id) ?? 0;
    const marketFit = getMarketFit(ride, state);
    const rideAttraction = ride.baseAttraction * (marketFit / 5);
    const duplicateMultiplier = getDuplicateMultiplier(seenCount);
    const adjustedAttraction = rideAttraction * duplicateMultiplier;

    duplicateCounts.set(ride.id, seenCount + 1);

    return {
      ride,
      marketFit,
      rideAttraction,
      duplicateMultiplier,
      adjustedAttraction
    };
  });
}

export function getRawMarketDemand(state: GameState): number {
  const localDemand = state.selectedLocation.population * 0.015;
  const touristDemand = state.selectedLocation.touristsPerMonth * 0.12;

  return localDemand + touristDemand;
}

export function getTotalRideCapacity(rides: BuiltRide[]): number {
  return rides.reduce((total, ride) => total + ride.monthlyCapacity, 0);
}

export function getTotalAttraction(state: GameState): number {
  return buildRideInsights(state).reduce((total, insight) => total + insight.adjustedAttraction, 0);
}

export function getPriceModifier(ticketPrice: number): number {
  return Math.max(0.35, 1 - (ticketPrice - 20) * 0.025);
}

export function getReputationModifier(reputation: number): number {
  return 0.5 + reputation;
}

export function getCompetitionModifier(state: GameState): number {
  return 1 - state.selectedLocation.competitionStrength;
}

function getVisitors(state: GameState, rawMarketDemand: number, totalAttraction: number): number {
  if (state.activeRides.length === 0) {
    return 0;
  }

  const attractionModifier = Math.min(1.5, totalAttraction / 100);
  const visitorsBeforeCapacity =
    rawMarketDemand *
    attractionModifier *
    getReputationModifier(state.reputation) *
    getCompetitionModifier(state) *
    getPriceModifier(state.ticketPrice);
  const totalRideCapacity = getTotalRideCapacity(state.activeRides);

  return Math.floor(Math.min(visitorsBeforeCapacity, totalRideCapacity));
}

function getSatisfaction(
  state: GameState,
  totalAttraction: number,
  visitors: number,
  totalRideCapacity: number
): number {
  if (state.activeRides.length === 0 || totalRideCapacity === 0) {
    return 0.2;
  }

  const valueScore = clamp(totalAttraction / state.ticketPrice / 5, 0.2, 1.2);
  const capacityUtilization = visitors / totalRideCapacity;
  const crowdingScore = clamp(1.2 - capacityUtilization, 0.4, 1);

  const rideInsights = buildRideInsights(state);
  const averageMarketFit =
    rideInsights.reduce((total, insight) => total + insight.marketFit / 5, 0) / rideInsights.length;
  const marketFitScore = clamp(averageMarketFit, 0.4, 1);

  return clamp(valueScore * 0.45 + crowdingScore * 0.25 + marketFitScore * 0.3, 0.1, 1);
}

function getParkValue(state: GameState, netProfit: number, cash: number): number {
  const rideAssetValue = state.activeRides.reduce((total, ride) => total + ride.buildCost * 0.7, 0);
  const profitValue = Math.max(0, netProfit * 24);

  return cash + rideAssetValue + profitValue - state.debt;
}

function buildRidePerformanceReport(state: GameState, visitors: number): RidePerformanceReport[] {
  const rideInsights = buildRideInsights(state);
  const totalAdjustedAttraction = rideInsights.reduce((total, insight) => total + insight.adjustedAttraction, 0);

  return rideInsights.map((insight) => {
    const attractionShare = totalAdjustedAttraction > 0 ? insight.adjustedAttraction / totalAdjustedAttraction : 0;
    const estimatedVisitors = Math.floor(visitors * attractionShare);
    const utilizationRate = clamp(estimatedVisitors / insight.ride.monthlyCapacity, 0, 1);
    const marketFitScore = insight.marketFit / 5;

    let comment = "Steady contributor this month.";

    if (insight.duplicateMultiplier < 1) {
      comment = "Value is reduced because similar rides are already in the park.";
    } else if (utilizationRate >= 0.9) {
      comment = "This ride is close to capacity and may benefit from support expansion.";
    } else if (marketFitScore >= 0.75 && utilizationRate >= 0.6) {
      comment = "Strong fit for this market and performing well.";
    } else if (insight.ride.monthlyMaintenance / Math.max(estimatedVisitors, 1) > 2) {
      comment = "Expensive to maintain for its current demand.";
    } else if (marketFitScore <= 0.45) {
      comment = "This ride is not a strong match for your current market.";
    }

    return {
      instanceId: insight.ride.instanceId,
      name: insight.ride.name,
      category: insight.ride.category,
      estimatedVisitors,
      utilizationRate,
      attractionContribution: insight.adjustedAttraction,
      marketFitScore,
      maintenanceCost: insight.ride.monthlyMaintenance,
      comment
    };
  });
}

function buildMessages(
  previousState: GameState,
  snapshot: Omit<SimulationSnapshot, "messages" | "ridePerformance">
): string[] {
  const messages: string[] = [];

  if (previousState.activeRides.length === 0 && snapshot.visitors === 0) {
    messages.push("You have no active rides yet, so the park could not attract any visitors this month.");
  }

  if (snapshot.visitors === snapshot.totalRideCapacity && snapshot.totalRideCapacity > 0) {
    messages.push("Visitor count was capped by ride capacity, which means expansion can unlock more demand.");
  }

  if (previousState.ticketPrice >= 30 && snapshot.satisfaction < previousState.satisfaction) {
    messages.push("Satisfaction fell because ticket price is high relative to your park's current attraction.");
  }

  const previousMaintenance = previousState.activeRides.reduce((sum, ride) => sum + ride.monthlyMaintenance, 0);
  if (snapshot.maintenanceCost > previousMaintenance) {
    messages.push("Profit was pressured by higher maintenance costs after adding more rides.");
  }

  if (previousState.selectedLocation.competitionStrength >= 0.5 && snapshot.visitors < snapshot.rawMarketDemand * 0.35) {
    messages.push("Strong local competition is making it harder for your park to capture demand.");
  }

  if (snapshot.reputation > previousState.reputation) {
    messages.push("Reputation improved because satisfaction stayed above the 70% comfort zone.");
  }

  if (snapshot.averageGuestSpend < 8) {
    messages.push("In-park revenue is being held back by low satisfaction or lower-spending market demand.");
  }

  if (snapshot.cash < 0 && previousState.debt >= previousState.maxDebt) {
    messages.push(
      "Your park is insolvent. You can continue playing, but you cannot build new rides until cash becomes positive."
    );
  }

  if (messages.length === 0) {
    if (snapshot.netProfit >= 0) {
      messages.push("The park stayed profitable this month, giving you room to keep expanding carefully.");
    } else {
      messages.push("The park lost money this month, so pricing, ride mix, or debt pressure likely needs attention.");
    }
  }

  return messages.slice(0, 4);
}

export function simulateMonth(previousState: GameState): SimulationSnapshot {
  const rawMarketDemand = getRawMarketDemand(previousState);
  const totalAttraction = getTotalAttraction(previousState);
  const totalRideCapacity = getTotalRideCapacity(previousState.activeRides);
  const visitors = getVisitors(previousState, rawMarketDemand, totalAttraction);
  const satisfaction = getSatisfaction(previousState, totalAttraction, visitors, totalRideCapacity);
  const ticketRevenue = visitors * previousState.ticketPrice;
  const averageGuestSpend = 8 * previousState.selectedLocation.spendingPower * satisfaction;
  const inParkRevenue = visitors * averageGuestSpend;
  const totalRevenue = ticketRevenue + inParkRevenue;
  const maintenanceCost = previousState.activeRides.reduce((sum, ride) => sum + ride.monthlyMaintenance, 0);
  const loanInterest = previousState.debt * (previousState.annualInterestRate / 12);
  const netProfit = totalRevenue - maintenanceCost - loanInterest;
  const cash = previousState.cash + netProfit;
  const reputation = clamp(previousState.reputation + (satisfaction - 0.7) * 0.15, 0.1, 2);
  const parkValue = getParkValue(previousState, netProfit, cash);
  const marketSpendingModifier = previousState.selectedLocation.spendingPower;
  const satisfactionRevenueModifier = satisfaction;
  const ridePerformance = buildRidePerformanceReport(previousState, visitors);

  const draftSnapshot = {
    rawMarketDemand,
    totalAttraction,
    totalRideCapacity,
    visitors,
    ticketRevenue,
    averageGuestSpend,
    inParkRevenue,
    totalRevenue,
    maintenanceCost,
    loanInterest,
    netProfit,
    cash,
    satisfaction,
    reputation,
    parkValue,
    marketSpendingModifier,
    satisfactionRevenueModifier
  };

  return {
    ...draftSnapshot,
    messages: buildMessages(previousState, draftSnapshot),
    ridePerformance
  };
}

export function buildMonthlyReport(previousState: GameState, snapshot: SimulationSnapshot): MonthlyReport {
  return {
    month: previousState.month,
    visitors: snapshot.visitors,
    ticketRevenue: snapshot.ticketRevenue,
    inParkRevenue: snapshot.inParkRevenue,
    totalRevenue: snapshot.totalRevenue,
    maintenanceCost: snapshot.maintenanceCost,
    loanInterest: snapshot.loanInterest,
    netProfit: snapshot.netProfit,
    cash: snapshot.cash,
    debt: previousState.debt,
    satisfaction: snapshot.satisfaction,
    reputation: snapshot.reputation,
    parkValue: snapshot.parkValue,
    areaUsed: previousState.areaUsed,
    areaCapacity: previousState.areaCapacity,
    averageGuestSpend: snapshot.averageGuestSpend,
    marketSpendingModifier: snapshot.marketSpendingModifier,
    satisfactionRevenueModifier: snapshot.satisfactionRevenueModifier,
    messages: snapshot.messages,
    ridePerformance: snapshot.ridePerformance
  };
}

export function getCurrentParkValue(state: GameState): number {
  if (state.latestReport) {
    return state.latestReport.parkValue;
  }

  return getParkValue(state, 0, state.cash);
}
