import { SAVE_KEY } from "./constants";
import type { GameState } from "./types";

export function saveGame(gameState: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

export function loadGame(): GameState | null {
  const serialized = localStorage.getItem(SAVE_KEY);

  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as Partial<GameState>;

    if (!parsed || !parsed.selectedLocation || !Array.isArray(parsed.rides)) {
      return null;
    }

    return parsed as GameState;
  } catch {
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
}
