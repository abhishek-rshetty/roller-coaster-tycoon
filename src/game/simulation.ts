import { clamp } from "../utils/math";
import { buildRideInsights, buildRidePerformanceReport } from "./mechanics";
import type { BuiltRide, GameState, MonthlyReport } from "./types";

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
  demolitionProceeds: number;
  netProfit: number;
  cash: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  marketSpendingModifier: number;
  satisfactionRevenueModifier: number;
  messages: string[];
  ridePerformance: MonthlyReport["ridePerformance"];
};

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

function getSoftOpeningVisitors(state: GameState, rawMarketDemand: number): number {
  const curiosityMultiplier = state.plannedRides.length > 0 ? 0.1 : 0.05;

  return Math.floor(
    rawMarketDemand * curiosityMultiplier * getCompetitionModifier(state) * getPriceModifier(state.ticketPrice)
  );
}

function getVisitors(state: GameState, rawMarketDemand: number, totalAttraction: number): number {
  if (state.activeRides.length === 0) {
    return getSoftOpeningVisitors(state, rawMarketDemand);
  }

  const attractionModifier = Math.min(1.5, 0.3 + totalAttraction / 120);
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

function getPlannedDemolitionProceeds(state: GameState): number {
  return state.plannedDemolitions.reduce((total, demolition) => total + demolition.refundValue, 0);
}

function buildMessages(
  previousState: GameState,
  snapshot: Omit<SimulationSnapshot, "messages" | "ridePerformance">
): string[] {
  const messages: string[] = [];

  if (previousState.activeRides.length === 0 && snapshot.visitors === 0) {
    messages.push("You have no active rides yet, so the park could not attract any visitors this month.");
  }

  if (previousState.activeRides.length === 0 && snapshot.visitors > 0) {
    messages.push("Soft-opening curiosity still brought in some visitors even before rides were operating.");
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

  if (snapshot.demolitionProceeds > 0) {
    messages.push("Demolition proceeds were added after the month closed, and the freed area is now available again.");
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
  const demolitionProceeds = getPlannedDemolitionProceeds(previousState);
  const netProfit = totalRevenue - maintenanceCost - loanInterest;
  const cash = previousState.cash + netProfit + demolitionProceeds;
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
    demolitionProceeds,
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
    demolitionProceeds: snapshot.demolitionProceeds,
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
