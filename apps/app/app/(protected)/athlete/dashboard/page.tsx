import { PageHeader } from "../../../../components/layout/page-header";
import { getAthleteDashboardData } from "../../../../lib/workspace";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function readinessLabel(score: number | null) {
  if (score === null) {
    return "No data";
  }

  if (score >= 75) {
    return "Ready";
  }

  if (score >= 55) {
    return "Watch";
  }

  return "Low";
}

export default async function AthleteDashboardPage() {
  const { workspace, summaries, totals } = await getAthleteDashboardData();

  const cards = [
    {
      label: "Athletes",
      value: totals.athletes.toString(),
      helper: `${totals.activeAthletes} active`,
    },
    {
      label: "Avg Readiness",
      value: totals.averageReadiness?.toString() ?? "No data",
      helper: "Latest 7D signal",
    },
    {
      label: "7D Load",
      value: formatNumber(totals.totalLoad),
      helper: "Minutes x RPE",
    },
    {
      label: "Profiles",
      value: summaries.filter((summary) => summary.position).length.toString(),
      helper: "With position data",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Workspace"
        title="Athlete View"
        description={`Athlete-level readiness, load and nutrition snapshot for ${workspace.organization.name}.`}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 truncate text-2xl font-extrabold text-foreground">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      {summaries.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {summaries.map((summary) => (
            <article
              key={summary.athleteId}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {summary.athleteName}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {summary.teamName ?? "No team"} ·{" "}
                    {summary.position ?? "No position"} ·{" "}
                    {formatStatus(summary.status)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {readinessLabel(summary.latestReadiness)}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Readiness
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {summary.latestReadiness ?? "No data"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Fatigue
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {summary.latestFatigue ?? "No data"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Hydration
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {summary.latestHydration ?? "No data"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    7D Load
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {formatNumber(summary.sevenDayLoad)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {summary.attendanceCount} attendance entries · Meal quality{" "}
                {summary.latestMealQuality ?? "No data"}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No athletes yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add athletes to start building athlete-level dashboards.
          </p>
        </div>
      )}
    </section>
  );
}
