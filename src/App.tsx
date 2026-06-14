import { useEffect, useState } from "react";
import {
  buildRide,
  cancelPlannedRide,
  createNewGame,
  repayLoan,
  setTicketPrice,
  simulateNextMonth,
  takeLoan
} from "./game/actions";
import { loadGame, resetGame, saveGame } from "./game/storage";
import type { GameState } from "./game/types";
import { Dashboard } from "./components/Dashboard";
import { LocationSelect } from "./components/LocationSelect";
import { StartScreen } from "./components/StartScreen";

type Screen = "start" | "location-select" | "dashboard";

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedGame = loadGame();
    setHasResume(Boolean(savedGame));
  }, []);

  function applyAction(transform: (currentState: GameState) => GameState) {
    if (!gameState) {
      return;
    }

    try {
      const nextState = transform(gameState);
      setGameState(nextState);
      saveGame(nextState);
      setHasResume(true);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    }
  }

  function applyActionAndScrollToReport(transform: (currentState: GameState) => GameState) {
    if (!gameState) {
      return;
    }

    try {
      const nextState = transform(gameState);
      setGameState(nextState);
      saveGame(nextState);
      setHasResume(true);
      setError(null);

      requestAnimationFrame(() => {
        document.getElementById("monthly-report")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    }
  }

  function handleResume() {
    const savedGame = loadGame();

    if (!savedGame) {
      setHasResume(false);
      return;
    }

    setGameState(savedGame);
    setScreen("dashboard");
    setError(null);
  }

  function handleStartNewGame(locationId: string) {
    const freshGame = createNewGame(locationId);
    setGameState(freshGame);
    saveGame(freshGame);
    setHasResume(true);
    setScreen("dashboard");
    setError(null);
  }

  function handleResetRun() {
    resetGame();
    setGameState(null);
    setHasResume(false);
    setScreen("start");
    setError(null);
  }

  if (screen === "start") {
    return (
      <StartScreen
        hasResume={hasResume}
        onNewGame={() => {
          setScreen("location-select");
          setError(null);
        }}
        onResume={handleResume}
      />
    );
  }

  if (screen === "location-select") {
    return <LocationSelect onBack={() => setScreen("start")} onSelect={handleStartNewGame} />;
  }

  if (!gameState) {
    return <StartScreen hasResume={hasResume} onNewGame={() => setScreen("location-select")} onResume={handleResume} />;
  }

  return (
    <Dashboard
      gameState={gameState}
      error={error}
      onReset={handleResetRun}
      onBuildRide={(rideId) => applyAction((currentState) => buildRide(currentState, rideId))}
      onCancelPlannedRide={(planId) => applyAction((currentState) => cancelPlannedRide(currentState, planId))}
      onSetTicketPrice={(price) => applyAction((currentState) => setTicketPrice(currentState, price))}
      onBorrow={() => applyAction((currentState) => takeLoan(currentState, 50000))}
      onRepay={() => applyAction((currentState) => repayLoan(currentState, 50000))}
      onRunMonth={() => applyActionAndScrollToReport((currentState) => simulateNextMonth(currentState))}
    />
  );
}

export default App;
