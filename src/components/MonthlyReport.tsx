import { useEffect, useMemo, useState } from "react";
import type { MonthlyReport as MonthlyReportType } from "../game/types";
import { formatMoney, formatPercent, formatNumber } from "../utils/format";
import { InfoTip } from "./InfoTip";

type MonthlyReportProps = {
  latestReport: MonthlyReportType | null;
  monthlyHistory: MonthlyReportType[];
};

export function MonthlyReport({ latestReport, monthlyHistory }: MonthlyReportProps) {
  const latestMonth = latestReport?.month ?? null;
  const [selectedMonth, setSelectedMonth] = useState<number | "latest">("latest");

  useEffect(() => {
    setSelectedMonth("latest");
  }, [monthlyHistory.length]);

  const visibleReport = useMemo(() => {
    if (selectedMonth === "latest") {
      return latestReport;
    }

    return monthlyHistory.find((report) => report.month === selectedMonth) ?? latestReport;
  }, [latestReport, monthlyHistory, selectedMonth]);

  return (
    <section className="panel panel--report" id="monthly-report">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Feedback</p>
          <h2>Monthly Report</h2>
        </div>
        {monthlyHistory.length > 0 ? (
          <label className="month-picker">
            <span>View Month</span>
            <select
              value={selectedMonth === "latest" ? "latest" : String(selectedMonth)}
              onChange={(event) =>
                setSelectedMonth(event.target.value === "latest" ? "latest" : Number(event.target.value))
              }
            >
              <option value="latest">{latestMonth ? `Latest (Month ${latestMonth})` : "Latest"}</option>
              {[...monthlyHistory]
                .sort((a, b) => b.month - a.month)
                .map((report) => (
                  <option key={report.month} value={report.month}>
                    Month {report.month}
                  </option>
                ))}
            </select>
          </label>
        ) : null}
      </div>

      {!visibleReport ? (
        <p className="empty-state">
          Run your first month to see visitors, profit, satisfaction, and why the park performed that way.
        </p>
      ) : (
        <div className="report-layout">
          <div className="report-section-grid">
            <div className="report-block">
              <h3>Operations</h3>
              <dl className="report-list">
                <div><dt>Month</dt><dd>{visibleReport.month}</dd></div>
                <div><dt>Visitors</dt><dd>{formatNumber(visibleReport.visitors)}</dd></div>
                <div><dt>Satisfaction</dt><dd>{formatPercent(visibleReport.satisfaction)}</dd></div>
                <div><dt>Reputation</dt><dd>{visibleReport.reputation.toFixed(2)}</dd></div>
              </dl>
            </div>

            <div className="report-block">
              <h3>Financials</h3>
              <dl className="report-list">
                <div><dt>Ticket Revenue</dt><dd>{formatMoney(visibleReport.ticketRevenue)}</dd></div>
                <div>
                  <dt>
                    <InfoTip
                      label="In-Park Revenue"
                      text="Improves when more visitors come in and when guest satisfaction is higher."
                    />
                  </dt>
                  <dd>{formatMoney(visibleReport.inParkRevenue)}</dd>
                </div>
                <div><dt>Total Revenue</dt><dd>{formatMoney(visibleReport.totalRevenue)}</dd></div>
                <div><dt>Maintenance</dt><dd>{formatMoney(visibleReport.maintenanceCost)}</dd></div>
                <div><dt>Loan Interest</dt><dd>{formatMoney(visibleReport.loanInterest)}</dd></div>
                <div><dt>Net Profit</dt><dd>{formatMoney(visibleReport.netProfit)}</dd></div>
                <div><dt>Cash</dt><dd>{formatMoney(visibleReport.cash)}</dd></div>
                <div><dt>Debt</dt><dd>{formatMoney(visibleReport.debt)}</dd></div>
                <div><dt>Park Value</dt><dd>{formatMoney(visibleReport.parkValue)}</dd></div>
              </dl>
            </div>
          </div>

          <div className="report-block">
            <h3>What Changed</h3>
            <div className="message-stack">
              {visibleReport.messages.map((message) => (
                <p className="report-message" key={message}>
                  {message}
                </p>
              ))}
            </div>
          </div>

          <div className="report-block">
            <h3>Ride Performance for Month {visibleReport.month}</h3>
            {visibleReport.ridePerformance.length === 0 ? (
              <p className="empty-state">No active rides were available for this month’s last-month performance breakdown.</p>
            ) : (
              <div className="ride-performance-list">
                {visibleReport.ridePerformance.map((ride) => (
                  <article className="ride-performance-card" key={`${visibleReport.month}-${ride.instanceId}`}>
                    <div className="ride-card__header">
                      <h4>{ride.name}</h4>
                      <span className="chip">{ride.category}</span>
                    </div>
                    <dl className="report-list">
                      <div><dt>Estimated Visitors</dt><dd>{formatNumber(ride.estimatedVisitors)}</dd></div>
                      <div>
                        <dt>
                          <InfoTip
                            label="Utilization"
                            text="How full this ride ran last month compared with its monthly capacity."
                          />
                        </dt>
                        <dd>{formatPercent(ride.utilizationRate)}</dd>
                      </div>
                      <div>
                        <dt>
                          <InfoTip
                            label="Attraction Share"
                            text="This ride's share of the park's total ride pull last month."
                          />
                        </dt>
                        <dd>{formatPercent(ride.attractionContribution)}</dd>
                      </div>
                      <div>
                        <dt>
                          <InfoTip
                            label="Market Fit"
                            text="How well this ride matches the current market mix for family, thrill, and tourist demand."
                          />
                        </dt>
                        <dd>{ride.marketFitScore.toFixed(2)} / 1.00</dd>
                      </div>
                      <div><dt>Maintenance</dt><dd>{formatMoney(ride.maintenanceCost)}</dd></div>
                    </dl>
                    <p className="report-message">{ride.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
