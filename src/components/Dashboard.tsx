import type { GameState } from "../game/types";
import { getCurrentParkValue } from "../game/simulation";
import { formatMoney, formatNumber, formatPercent } from "../utils/format";
import { buildStatBarData, StatBar } from "./StatBar";
import { RideCatalog } from "./RideCatalog";
import { BuiltRides } from "./BuiltRides";
import { PricingPanel } from "./PricingPanel";
import { LoanPanel } from "./LoanPanel";
import { MonthlyReport } from "./MonthlyReport";
import { PlannedBuilds } from "./PlannedBuilds";

type DashboardProps = {
  gameState: GameState;
  error: string | null;
  onReset: () => void;
  onBuildRide: (rideId: string) => void;
  onCancelPlannedRide: (planId: string) => void;
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
  onCancelPlannedRide,
  onSetTicketPrice,
  onBorrow,
  onRepay,
  onRunMonth
}: DashboardProps) {
  const latestReport = gameState.latestReport;
  const availableCash = gameState.cash - gameState.reservedCash;
  const availableArea = gameState.areaCapacity - gameState.areaUsed - gameState.reservedArea;
  const stats = buildStatBarData({
    month: gameState.month,
    cash: formatMoney(gameState.cash),
    monthlyProfit: formatMoney(latestReport?.netProfit ?? 0),
    visitors: formatNumber(latestReport?.visitors ?? 0),
    satisfaction: formatPercent(gameState.satisfaction),
    reputation: gameState.reputation.toFixed(2),
    parkValue: formatMoney(getCurrentParkValue(gameState)),
    debt: formatMoney(gameState.debt),
    areaSummary: `${gameState.areaUsed + gameState.reservedArea} / ${gameState.areaCapacity}`
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

      <div className="resource-strip">
        <span>Available Cash: {formatMoney(availableCash)}</span>
        <span>Reserved Cash: {formatMoney(gameState.reservedCash)}</span>
        <span>Available Area: {availableArea}</span>
        <span>Reserved Area: {gameState.reservedArea}</span>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="dashboard-grid">
        <RideCatalog availableCash={availableCash} availableArea={availableArea} onBuild={onBuildRide} />
        <PlannedBuilds plannedRides={gameState.plannedRides} onCancel={onCancelPlannedRide} />
        <BuiltRides rides={gameState.activeRides} />
        <PricingPanel ticketPrice={gameState.ticketPrice} onSetTicketPrice={onSetTicketPrice} />
        <LoanPanel
          cash={gameState.cash}
          debt={gameState.debt}
          maxDebt={gameState.maxDebt}
          annualInterestRate={gameState.annualInterestRate}
          onBorrow={onBorrow}
          onRepay={onRepay}
        />
        <MonthlyReport latestReport={gameState.latestReport} monthlyHistory={gameState.monthlyHistory} />
      </div>

      <div className="footer-actions">
        <button className="button button--primary button--large" onClick={onRunMonth}>
          Run Next Month
        </button>
      </div>
    </section>
  );
}
