import type { GameState } from "../game/types";
import { getCurrentParkValue } from "../game/simulation";
import { buildStatBarData, StatBar } from "./StatBar";
import { RideCatalog } from "./RideCatalog";
import { BuiltRides } from "./BuiltRides";
import { PricingPanel } from "./PricingPanel";
import { LoanPanel } from "./LoanPanel";
import { MonthlyReport } from "./MonthlyReport";

type DashboardProps = {
  gameState: GameState;
  error: string | null;
  onReset: () => void;
  onBuildRide: (rideId: string) => void;
  onSetTicketPrice: (price: number) => void;
  onBorrow: () => void;
  onRepay: () => void;
  onRunMonth: () => void;
};

export function Dashboard({
  gameState,
  error,
  onReset,
  onBuildRide,
  onSetTicketPrice,
  onBorrow,
  onRepay,
  onRunMonth
}: DashboardProps) {
  const latestReport = gameState.latestReport;
  const landRemaining = gameState.landCapacity - gameState.landUsed;
  const stats = buildStatBarData({
    month: gameState.month,
    cash: gameState.cash,
    monthlyProfit: latestReport?.netProfit ?? 0,
    visitors: latestReport?.visitors ?? 0,
    satisfaction: gameState.satisfaction,
    reputation: gameState.reputation,
    parkValue: getCurrentParkValue(gameState),
    debt: gameState.debt,
    landUsed: gameState.landUsed,
    landCapacity: gameState.landCapacity
  });

  return (
    <section className="shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">{gameState.selectedLocation.name}</p>
          <h1>Park Dashboard</h1>
          <p className="muted">
            Match your ride mix to the market and use the monthly report to steer your next move.
          </p>
        </div>
        <button className="button button--ghost" onClick={onReset}>
          New Run
        </button>
      </div>

      <StatBar stats={stats} />

      {error ? <div className="alert">{error}</div> : null}

      <div className="dashboard-grid">
        <RideCatalog cash={gameState.cash} landRemaining={landRemaining} onBuild={onBuildRide} />
        <BuiltRides rides={gameState.rides} />
        <PricingPanel ticketPrice={gameState.ticketPrice} onSetTicketPrice={onSetTicketPrice} />
        <LoanPanel
          cash={gameState.cash}
          debt={gameState.debt}
          maxDebt={gameState.maxDebt}
          annualInterestRate={gameState.annualInterestRate}
          onBorrow={onBorrow}
          onRepay={onRepay}
        />
        <MonthlyReport report={gameState.latestReport} />
      </div>

      <div className="footer-actions">
        <button className="button button--primary button--large" onClick={onRunMonth}>
          Run Next Month
        </button>
      </div>
    </section>
  );
}
