import { SAVE_KEY } from "./constants";
import type { BuiltRide, GameState, Location } from "./types";

type LegacyGameState = {
  selectedLocation?: Location;
  month?: number;
  cash?: number;
  debt?: number;
  maxDebt?: number;
  annualInterestRate?: number;
  ticketPrice?: number;
  landUsed?: number;
  landCapacity?: number;
  reputation?: number;
  satisfaction?: number;
  rides?: BuiltRide[];
  latestReport?: GameState["latestReport"];
  monthlyHistory?: GameState["monthlyHistory"];
};

export function saveGame(gameState: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function getLegacyNumber(value: unknown, key: string, fallback: number): number {
  if (value && typeof value === "object" && key in value) {
    const candidate = (value as Record<string, unknown>)[key];
    return typeof candidate === "number" ? candidate : fallback;
  }

  return fallback;
}

function looksLikeCurrentSave(value: unknown): value is GameState {
  return Boolean(
    value &&
      typeof value === "object" &&
      "selectedLocation" in value &&
      "activeRides" in value &&
      "plannedRides" in value
  );
}

function normalizeCurrentSave(parsed: GameState): GameState {
  const normalizeRidePerformance = (
    ridePerformance: GameState["monthlyHistory"][number]["ridePerformance"] | undefined
  ) =>
    Array.isArray(ridePerformance)
      ? ridePerformance.map((ride) => ({
          ...ride,
          ageMonths: typeof ride.ageMonths === "number" ? ride.ageMonths : 1,
          demolitionRefundValue: typeof ride.demolitionRefundValue === "number" ? ride.demolitionRefundValue : 0
        }))
      : [];

  return {
    ...parsed,
    plannedDemolitions: Array.isArray(parsed.plannedDemolitions) ? parsed.plannedDemolitions : [],
    reservedCash: typeof parsed.reservedCash === "number" ? parsed.reservedCash : 0,
    reservedArea: typeof parsed.reservedArea === "number" ? parsed.reservedArea : 0,
    latestReport: parsed.latestReport
      ? {
          ...parsed.latestReport,
          demolitionProceeds:
            typeof parsed.latestReport.demolitionProceeds === "number" ? parsed.latestReport.demolitionProceeds : 0,
          ridePerformance: normalizeRidePerformance(parsed.latestReport.ridePerformance)
        }
      : null,
    monthlyHistory: Array.isArray(parsed.monthlyHistory)
      ? parsed.monthlyHistory.map((report) => ({
          ...report,
          demolitionProceeds: typeof report.demolitionProceeds === "number" ? report.demolitionProceeds : 0,
          ridePerformance: normalizeRidePerformance(report.ridePerformance)
        }))
      : []
  };
}

function migrateLegacySave(parsed: LegacyGameState): GameState | null {
  if (!parsed.selectedLocation || !Array.isArray(parsed.rides)) {
    return null;
  }

  return {
    selectedLocation: parsed.selectedLocation,
    month: parsed.month ?? 1,
    cash: parsed.cash ?? 500000,
    debt: parsed.debt ?? 0,
    maxDebt: parsed.maxDebt ?? 1000000,
    annualInterestRate: parsed.annualInterestRate ?? 0.08,
    ticketPrice: parsed.ticketPrice ?? 20,
    areaUsed: parsed.landUsed ?? 0,
    areaCapacity: parsed.landCapacity ?? 30,
    reservedCash: 0,
    reservedArea: 0,
    reputation: parsed.reputation ?? 0.5,
    satisfaction: parsed.satisfaction ?? 0.7,
    activeRides: parsed.rides.map((ride) => ({
      ...ride,
      areaRequired: getLegacyNumber(ride, "areaRequired", getLegacyNumber(ride, "footprint", 0))
    })),
    plannedRides: [],
    plannedDemolitions: [],
    latestReport: parsed.latestReport
      ? {
          ...parsed.latestReport,
          areaUsed: getLegacyNumber(parsed.latestReport, "areaUsed", getLegacyNumber(parsed.latestReport, "landUsed", 0)),
          areaCapacity: getLegacyNumber(
            parsed.latestReport,
            "areaCapacity",
            getLegacyNumber(parsed.latestReport, "landCapacity", 30)
          ),
          averageGuestSpend: getLegacyNumber(parsed.latestReport, "averageGuestSpend", 0),
          marketSpendingModifier:
            getLegacyNumber(parsed.latestReport, "marketSpendingModifier", 1),
          satisfactionRevenueModifier:
            getLegacyNumber(parsed.latestReport, "satisfactionRevenueModifier", 0),
          demolitionProceeds: getLegacyNumber(parsed.latestReport, "demolitionProceeds", 0),
          ridePerformance:
            parsed.latestReport && typeof parsed.latestReport === "object" && "ridePerformance" in parsed.latestReport
              ? (((parsed.latestReport as Record<string, unknown>).ridePerformance as GameState["monthlyHistory"][number]["ridePerformance"]).map((ride) => ({
                  ...ride,
                  ageMonths: typeof ride.ageMonths === "number" ? ride.ageMonths : 1,
                  demolitionRefundValue: typeof ride.demolitionRefundValue === "number" ? ride.demolitionRefundValue : 0
                })))
              : []
        }
      : null,
    monthlyHistory: Array.isArray(parsed.monthlyHistory)
      ? parsed.monthlyHistory.map((report) => ({
          ...report,
          areaUsed: getLegacyNumber(report, "areaUsed", getLegacyNumber(report, "landUsed", 0)),
          areaCapacity: getLegacyNumber(report, "areaCapacity", getLegacyNumber(report, "landCapacity", 30)),
          averageGuestSpend: getLegacyNumber(report, "averageGuestSpend", 0),
          marketSpendingModifier: getLegacyNumber(report, "marketSpendingModifier", 1),
          satisfactionRevenueModifier: getLegacyNumber(report, "satisfactionRevenueModifier", 0),
          demolitionProceeds: getLegacyNumber(report, "demolitionProceeds", 0),
          ridePerformance:
            report && typeof report === "object" && "ridePerformance" in report
              ? (((report as Record<string, unknown>).ridePerformance as GameState["monthlyHistory"][number]["ridePerformance"]).map((ride) => ({
                  ...ride,
                  ageMonths: typeof ride.ageMonths === "number" ? ride.ageMonths : 1,
                  demolitionRefundValue: typeof ride.demolitionRefundValue === "number" ? ride.demolitionRefundValue : 0
                })))
              : []
        }))
      : []
  };
}

export function loadGame(): GameState | null {
  const serialized = localStorage.getItem(SAVE_KEY);

  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as unknown;

    if (looksLikeCurrentSave(parsed)) {
      return normalizeCurrentSave(parsed);
    }

    return migrateLegacySave(parsed as LegacyGameState);
  } catch {
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
}
