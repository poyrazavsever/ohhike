import { PageHeader } from "../../../components/layout/page-header";
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

  const cards = [
    {
      label: "7D Load",
      value: formatNumber(totals.totalLoad),
      helper: "Minutes x RPE",
    },
    {
      label: "Sessions",
      value: totals.sessions.toString(),
      helper: "Last 7 days",
    },
    {
      label: "Attendance",
      value: totals.attendanceEntries.toString(),
      helper: "Tracked entries",
    },
    {
      label: "Avg Readiness",
      value: totals.averageReadiness?.toString() ?? "No data",
      helper: "Last 7 days",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Performance Data"
        title="Load & Recovery"
        description={`Seven-day workload and recovery overview for ${workspace.organization.name}.`}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Team load</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Workload distribution by team over the last 7 days.
          </p>

          <div className="mt-5 grid gap-3">
            {teamSummaries.length > 0 ? (
              teamSummaries.map((team) => (
                <div
                  key={team.teamId}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-foreground">
                        {team.teamName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {team.attendanceCount} attendance entries · Avg RPE{" "}
                        {team.averageRpe ?? "-"}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-foreground">
                      {formatNumber(team.totalLoad)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
                No team load data yet.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="text-sm font-extrabold text-foreground">
              Athlete load watch
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Highest recent workload with readiness and fatigue context.
            </p>
          </div>

          {topAthletes.length > 0 ? (
            <div className="divide-y divide-border">
              {topAthletes.map((athlete) => (
                <article
                  key={athlete.athleteId}
                  className="grid gap-4 p-5 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]"
                >
                  <div>
                    <p className="font-extrabold text-foreground">
                      {athlete.athleteName}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {athlete.teamName ?? "No team"} ·{" "}
                      {riskLabel({
                        totalLoad: athlete.totalLoad,
                        averageReadiness: athlete.averageReadiness,
                        latestFatigue: athlete.latestFatigue,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Load
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-foreground">
                      {formatNumber(athlete.totalLoad)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-foreground">
                      {athlete.averageReadiness ?? "No data"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Fatigue
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-foreground">
                      {athlete.latestFatigue ?? "No data"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-foreground">
                No load data yet
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Add session attendance with minutes and RPE to start tracking load.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
