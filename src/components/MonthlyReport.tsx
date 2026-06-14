import type { MonthlyReport as MonthlyReportType } from "../game/types";
import { formatMoney, formatPercent, formatNumber } from "../utils/format";

type MonthlyReportProps = {
  report: MonthlyReportType | null;
};

export function MonthlyReport({ report }: MonthlyReportProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Feedback</p>
          <h2>Monthly Report</h2>
        </div>
      </div>

      {!report ? (
        <p className="empty-state">
          Run your first month to see visitors, profit, satisfaction, and why the park performed that way.
        </p>
      ) : (
        <div className="report-layout">
          <dl className="report-grid">
            <div>
              <dt>Month</dt>
              <dd>{report.month}</dd>
            </div>
            <div>
              <dt>Visitors</dt>
              <dd>{formatNumber(report.visitors)}</dd>
            </div>
            <div>
              <dt>Ticket Revenue</dt>
              <dd>{formatMoney(report.ticketRevenue)}</dd>
            </div>
            <div>
              <dt>In-Park Revenue</dt>
              <dd>{formatMoney(report.inParkRevenue)}</dd>
            </div>
            <div>
              <dt>Total Revenue</dt>
              <dd>{formatMoney(report.totalRevenue)}</dd>
            </div>
            <div>
              <dt>Maintenance</dt>
              <dd>{formatMoney(report.maintenanceCost)}</dd>
            </div>
            <div>
              <dt>Loan Interest</dt>
              <dd>{formatMoney(report.loanInterest)}</dd>
            </div>
            <div>
              <dt>Net Profit</dt>
              <dd>{formatMoney(report.netProfit)}</dd>
            </div>
            <div>
              <dt>Cash</dt>
              <dd>{formatMoney(report.cash)}</dd>
            </div>
            <div>
              <dt>Debt</dt>
              <dd>{formatMoney(report.debt)}</dd>
            </div>
            <div>
              <dt>Satisfaction</dt>
              <dd>{formatPercent(report.satisfaction)}</dd>
            </div>
            <div>
              <dt>Reputation</dt>
              <dd>{report.reputation.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Park Value</dt>
              <dd>{formatMoney(report.parkValue)}</dd>
            </div>
          </dl>

          <div className="message-stack">
            {report.messages.map((message) => (
              <p className="report-message" key={message}>
                {message}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
