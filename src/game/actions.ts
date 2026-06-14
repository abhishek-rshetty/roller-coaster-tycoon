import { locations } from "../data/locations";
import { rideCatalog } from "../data/rides";
import { ALLOWED_TICKET_PRICES, LOAN_INCREMENT, STARTING_STATE } from "./constants";
import { buildMonthlyReport, simulateMonth } from "./simulation";
import type { GameState } from "./types";
import { generateId } from "../utils/format";

export function createNewGame(locationId: string): GameState {
  const selectedLocation = locations.find((location) => location.id === locationId);

  if (!selectedLocation) {
    throw new Error("Unknown location.");
  }

  return {
    ...STARTING_STATE,
    selectedLocation: { ...selectedLocation }
  };
}

export function buildRide(gameState: GameState, rideId: string): GameState {
  const rideDefinition = rideCatalog.find((ride) => ride.id === rideId);

  if (!rideDefinition) {
    throw new Error("Unknown ride.");
  }

  if (gameState.cash < rideDefinition.buildCost) {
    throw new Error("Insufficient cash.");
  }

  if (gameState.landUsed + rideDefinition.footprint > gameState.landCapacity) {
    throw new Error("Insufficient land.");
  }

  return {
    ...gameState,
    cash: gameState.cash - rideDefinition.buildCost,
    landUsed: gameState.landUsed + rideDefinition.footprint,
    rides: [
      ...gameState.rides,
      {
        ...rideDefinition,
        instanceId: generateId(),
        builtMonth: gameState.month
      }
    ]
  };
}

export function setTicketPrice(gameState: GameState, price: number): GameState {
  if (!ALLOWED_TICKET_PRICES.includes(price as (typeof ALLOWED_TICKET_PRICES)[number])) {
    throw new Error("Ticket price must be one of the allowed values.");
  }

  return {
    ...gameState,
    ticketPrice: price
  };
}

export function takeLoan(gameState: GameState, amount: number): GameState {
  if (amount !== LOAN_INCREMENT) {
    throw new Error("Loan amount must be 50000.");
  }

  if (gameState.debt + amount > gameState.maxDebt) {
    throw new Error("Debt limit reached.");
  }

  return {
    ...gameState,
    cash: gameState.cash + amount,
    debt: gameState.debt + amount
  };
}

export function repayLoan(gameState: GameState, amount: number): GameState {
  if (amount !== LOAN_INCREMENT) {
    throw new Error("Repayment amount must be 50000.");
  }

  if (gameState.cash < amount) {
    throw new Error("Not enough cash to repay this amount.");
  }

  if (gameState.debt < amount) {
    throw new Error("Debt is lower than the repayment amount.");
  }

  return {
    ...gameState,
    cash: gameState.cash - amount,
    debt: gameState.debt - amount
  };
}

export function simulateNextMonth(gameState: GameState): GameState {
  const snapshot = simulateMonth(gameState);
  const latestReport = buildMonthlyReport(gameState, snapshot);

  return {
    ...gameState,
    month: gameState.month + 1,
    cash: latestReport.cash,
    satisfaction: latestReport.satisfaction,
    reputation: latestReport.reputation,
    latestReport,
    monthlyHistory: [...gameState.monthlyHistory, latestReport],
    selectedLocation: {
      ...gameState.selectedLocation,
      population: gameState.selectedLocation.population * (1 + gameState.selectedLocation.growthRateMonthly),
      touristsPerMonth:
        gameState.selectedLocation.touristsPerMonth * (1 + gameState.selectedLocation.growthRateMonthly)
    }
  };
}
