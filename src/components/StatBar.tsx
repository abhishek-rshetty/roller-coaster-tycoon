import { formatMoney, formatPercent } from "../utils/format";

type StatBarProps = {
  stats: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "good" | "bad";
  }>;
};

export function StatBar({ stats }: StatBarProps) {
  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article className={`stat-card stat-card--${stat.tone ?? "neutral"}`} key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}

export function buildStatBarData(input: {
  month: number;
  cash: number;
  monthlyProfit: number;
  visitors: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  debt: number;
  landUsed: number;
  landCapacity: number;
}): Array<{
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad";
}> {
  return [
    { label: "Month", value: String(input.month) },
    { label: "Cash", value: formatMoney(input.cash), tone: input.cash >= 0 ? "good" : "bad" },
    {
      label: "Monthly Profit",
      value: formatMoney(input.monthlyProfit),
      tone: input.monthlyProfit >= 0 ? "good" : "bad"
    },
    { label: "Visitors", value: input.visitors.toLocaleString() },
    { label: "Satisfaction", value: formatPercent(input.satisfaction) },
    { label: "Reputation", value: input.reputation.toFixed(2) },
    { label: "Park Value", value: formatMoney(input.parkValue), tone: "good" },
    { label: "Debt", value: formatMoney(input.debt), tone: input.debt > 0 ? "bad" : "neutral" },
    { label: "Land", value: `${input.landUsed} / ${input.landCapacity}` }
  ];
}
