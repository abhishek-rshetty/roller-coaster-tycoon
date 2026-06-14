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
  cash: string;
  monthlyProfit: string;
  visitors: string;
  satisfaction: string;
  reputation: string;
  parkValue: string;
  debt: string;
  areaSummary: string;
}): Array<{
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad";
}> {
  return [
    { label: "Month", value: String(input.month) },
    { label: "Cash", value: input.cash, tone: input.cash.startsWith("-") ? "bad" : "good" },
    { label: "Monthly Profit", value: input.monthlyProfit },
    { label: "Visitors", value: input.visitors },
    { label: "Satisfaction", value: input.satisfaction },
    { label: "Reputation", value: input.reputation },
    { label: "Park Value", value: input.parkValue, tone: "good" },
    { label: "Debt", value: input.debt },
    { label: "Area", value: input.areaSummary }
  ];
}
