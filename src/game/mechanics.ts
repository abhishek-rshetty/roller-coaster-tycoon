import { clamp } from "../utils/math";
import type { BuiltRide, GameState, RideDefinition, RidePerformanceReport } from "./types";

export type RideInsight = {
  ride: BuiltRide;
  marketFit: number;
  rideAttraction: number;
  duplicateMultiplier: number;
  adjustedAttraction: number;
};

export function getRideMarketFit(ride: RideDefinition, state: GameState): number {
  return (
    ride.familyAppeal * state.selectedLocation.familyShare +
    ride.thrillAppeal * state.selectedLocation.thrillShare +
    ride.touristAppeal * state.selectedLocation.touristShare
  );
}

export function getRideDuplicateMultiplier(duplicateIndex: number): number {
  return Math.max(0.4, 1 - duplicateIndex * 0.2);
}

export function getRideAgeMonths(ride: BuiltRide, currentMonth: number): number {
  return Math.max(1, currentMonth - ride.builtMonth + 1);
}

export function getRideDepreciatedValue(ride: BuiltRide, currentMonth: number): number {
  const ageMonths = getRideAgeMonths(ride, currentMonth);
  return Math.max(0, ride.buildCost * Math.pow(0.9, ageMonths));
}

export function buildRideInsights(state: GameState): RideInsight[] {
  const duplicateCounts = new Map<string, number>();

  return state.activeRides.map((ride) => {
    const seenCount = duplicateCounts.get(ride.id) ?? 0;
    const marketFit = getRideMarketFit(ride, state);
    const rideAttraction = ride.baseAttraction * (marketFit / 5);
    const duplicateMultiplier = getRideDuplicateMultiplier(seenCount);
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

export function buildRidePerformanceReport(state: GameState, visitors: number): RidePerformanceReport[] {
  const rideInsights = buildRideInsights(state);
  const totalAdjustedAttraction = rideInsights.reduce((total, insight) => total + insight.adjustedAttraction, 0);

  return rideInsights.map((insight) => {
    const attractionShare = totalAdjustedAttraction > 0 ? insight.adjustedAttraction / totalAdjustedAttraction : 0;
    const estimatedVisitors = Math.floor(visitors * attractionShare);
    const utilizationRate = clamp(estimatedVisitors / insight.ride.monthlyCapacity, 0, 1);
    const marketFitScore = insight.marketFit / 5;
    const ageMonths = getRideAgeMonths(insight.ride, state.month);
    const demolitionRefundValue = getRideDepreciatedValue(insight.ride, state.month);

    let comment = "Steady contributor this month.";

    if (insight.duplicateMultiplier < 1) {
      comment = "Value is reduced because similar rides are already in the park.";
    } else if (utilizationRate >= 0.9) {
      comment = "This ride is close to capacity and may benefit from support expansion.";
    } else if (marketFitScore >= 0.75 && utilizationRate >= 0.6) {
      comment = "Strong fit for this market and performing well.";
    } else if (marketFitScore <= 0.45) {
      comment = "This ride is not a strong match for your current market.";
    } else if (insight.ride.monthlyMaintenance >= 20000 && utilizationRate < 0.18) {
      comment = "Expensive to maintain for its current demand.";
    }

    return {
      instanceId: insight.ride.instanceId,
      name: insight.ride.name,
      category: insight.ride.category,
      ageMonths,
      estimatedVisitors,
      utilizationRate,
      attractionContribution: attractionShare,
      marketFitScore,
      maintenanceCost: insight.ride.monthlyMaintenance,
      demolitionRefundValue,
      comment
    };
  });
}
