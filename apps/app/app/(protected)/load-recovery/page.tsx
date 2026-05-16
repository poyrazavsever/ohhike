import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getLoadRecoveryData } from "../../../lib/workspace";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value);
}

function riskLabel({
  totalLoad,
  averageReadiness,
  latestFatigue,
}: {
  totalLoad: number;
  averageReadiness: number | null;
  latestFatigue: number | null;
}) {
  if (totalLoad >= 800 && (averageReadiness ?? 100) < 60) {
    return "High risk";
  }

  if (latestFatigue !== null && latestFatigue >= 8) {
    return "Fatigue watch";
  }

  if (totalLoad >= 500) {
    return "Load watch";
  }

  return "Normal";
}

export default async function LoadRecoveryPage() {
  const { workspace, teamSummaries, athleteSummaries, totals } =
    await getLoadRecoveryData();
  const topAthletes = athleteSummaries.slice(0, 8);

  const metricCards = [
    {
      label: "7D Load",
      value: formatNumber(totals.totalLoad),
      helper: "Minutes x RPE",
      icon: "solar:chart-2-bold",
    },
    {
      label: "Sessions",
      value: totals.sessions.toString(),
      helper: "Last 7 days",
      icon: "solar:clipboard-list-bold",
      tone: "info" as const,
    },
    {
      label: "Attendance",
      value: totals.attendanceEntries.toString(),
      helper: "Tracked entries",
      icon: "solar:user-check-rounded-bold",
      tone: "secondary" as const,
    },
    {
      label: "Avg Readiness",
      value: totals.averageReadiness?.toString() ?? "No data",
      helper: "Last 7 days",
      icon: "solar:pulse-2-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Load & Recovery"
        subtitle={`Seven-day workload and recovery overview for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/dinlenme.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-black text-foreground">Team load</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Workload distribution by team over the last 7 days.
          </p>

          <div className="mt-4 grid gap-2">
            {teamSummaries.length > 0 ? (
              teamSummaries.map((team) => (
                <div
                  key={team.teamId}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-foreground">
                        {team.teamName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {team.attendanceCount} attendance entries · Avg RPE{" "}
                        {team.averageRpe ?? "-"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-foreground">
                      {formatNumber(team.totalLoad)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
                No team load data yet.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-black text-foreground">
              Athlete load watch
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Highest recent workload with readiness and fatigue context.
            </p>
          </div>

          {topAthletes.length > 0 ? (
            <div className="divide-y divide-border">
              {topAthletes.map((athlete) => (
                <article
                  key={athlete.athleteId}
                  className="grid gap-3 p-4 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]"
                >
                  <div>
                    <p className="font-black text-foreground">
                      {athlete.athleteName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {athlete.teamName ?? "No team"} ·{" "}
                      {riskLabel({
                        totalLoad: athlete.totalLoad,
                        averageReadiness: athlete.averageReadiness,
                        latestFatigue: athlete.latestFatigue,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Load
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {formatNumber(athlete.totalLoad)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {athlete.averageReadiness ?? "No data"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Fatigue
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {athlete.latestFatigue ?? "No data"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              title="No load data yet"
              description="Add session attendance with minutes and RPE to start tracking load."
              icon="solar:shield-warning-bold"
            />
          )}
        </div>
      </div>
    </section>
  );
}
