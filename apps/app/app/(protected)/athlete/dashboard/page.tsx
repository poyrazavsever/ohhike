import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
import {
  DashboardAgenda,
  DashboardMiniCalendar,
} from "../../../../components/dashboard/dashboard-calendar";
import { AthleteAttentionPanel } from "../../../../components/dashboard/dashboard-operations";
import {
  getAthleteDashboardData,
  getCalendarData,
} from "../../../../lib/workspace";

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
  const { sessions } = await getCalendarData();

  const metricCards = [
    {
      label: "Athletes",
      value: totals.athletes.toString(),
      helper: `${totals.activeAthletes} active`,
      icon: "solar:user-id-bold",
    },
    {
      label: "Avg Readiness",
      value: totals.averageReadiness?.toString() ?? "No data",
      helper: "Latest 7D signal",
      icon: "solar:pulse-2-bold",
      tone: "info" as const,
    },
    {
      label: "7D Load",
      value: formatNumber(totals.totalLoad),
      helper: "Minutes x RPE",
      icon: "solar:chart-2-bold",
      tone: "secondary" as const,
    },
    {
      label: "Profiles",
      value: summaries.filter((summary) => summary.position).length.toString(),
      helper: "With position data",
      icon: "solar:user-rounded-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Workspace"
        title="Athlete View"
        subtitle={`Athlete-level readiness, load and nutrition snapshot for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/kalpTutma.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {summaries.length > 0 ? (
        <div className="mt-4">
          <AthleteAttentionPanel summaries={summaries} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardMiniCalendar sessions={sessions} />
        <DashboardAgenda sessions={sessions} title="Training schedule" />
      </div>

      {summaries.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-black text-foreground">
              Athlete roster health
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Latest readiness, hydration and workload context per athlete.
            </p>
          </div>
          <div className="grid gap-3 p-4 xl:grid-cols-2">
            {summaries.map((summary) => (
              <article
                key={summary.athleteId}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      {summary.athleteName}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      {summary.teamName ?? "No team"} ·{" "}
                      {summary.position ?? "No position"} ·{" "}
                      {formatStatus(summary.status)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                    {readinessLabel(summary.latestReadiness)}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-4">
                  <DetailStat
                    label="Readiness"
                    value={summary.latestReadiness ?? "No data"}
                  />
                  <DetailStat
                    label="Fatigue"
                    value={summary.latestFatigue ?? "No data"}
                  />
                  <DetailStat
                    label="Hydration"
                    value={summary.latestHydration ?? "No data"}
                  />
                  <DetailStat
                    label="7D Load"
                    value={formatNumber(summary.sevenDayLoad)}
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  {summary.attendanceCount} attendance entries · Meal quality{" "}
                  {summary.latestMealQuality ?? "No data"}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyStateCard
          title="No athletes yet"
          description="Add athletes to start building athlete-level dashboards."
          icon="solar:user-heart-bold"
        />
      )}
    </section>
  );
}
