import type { GameState } from "./types";

export const SAVE_KEY = "browser-tycoon-mvp-save";
export const LOAN_INCREMENT = 50000;
export const ALLOWED_TICKET_PRICES = [10, 20, 30, 40, 50] as const;
export const STARTING_STATE: Omit<GameState, "selectedLocation"> = {
  month: 1,
  cash: 500000,
  debt: 0,
  maxDebt: 1000000,
  annualInterestRate: 0.08,
  ticketPrice: 20,
  areaUsed: 0,
  areaCapacity: 30,
  reservedCash: 0,
  reservedArea: 0,
  reputation: 0.5,
  satisfaction: 0.7,
  activeRides: [],
  plannedRides: [],
  latestReport: null,
  monthlyHistory: []
};
