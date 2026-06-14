import { LOAN_INCREMENT } from "../game/constants";
import { formatMoney } from "../utils/format";

type LoanPanelProps = {
  cash: number;
  debt: number;
  maxDebt: number;
  annualInterestRate: number;
  onBorrow: () => void;
  onRepay: () => void;
};

export function LoanPanel({
  cash,
  debt,
  maxDebt,
  annualInterestRate,
  onBorrow,
  onRepay
}: LoanPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Finance</p>
          <h2>Loans</h2>
        </div>
      </div>

      <dl className="info-list">
        <div>
          <dt>Current Debt</dt>
          <dd>{formatMoney(debt)}</dd>
        </div>
        <div>
          <dt>Maximum Debt</dt>
          <dd>{formatMoney(maxDebt)}</dd>
        </div>
        <div>
          <dt>Annual Interest</dt>
          <dd>{(annualInterestRate * 100).toFixed(1)}%</dd>
        </div>
      </dl>

      <div className="button-row">
        <button className="button button--secondary" disabled={debt + LOAN_INCREMENT > maxDebt} onClick={onBorrow}>
          Borrow $50,000
        </button>
        <button className="button button--secondary" disabled={cash < LOAN_INCREMENT || debt < LOAN_INCREMENT} onClick={onRepay}>
          Repay $50,000
        </button>
      </div>
    </section>
  );
}
