import Link from "next/link";

import type {
  AthleteDashboardSummary,
  CalendarSession,
} from "../../lib/workspace";

function formatTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function summaryTone(value: number) {
  return value > 0
    ? "border-warning/30 bg-warning-soft text-warning-foreground"
    : "border-success/30 bg-success-soft text-success-foreground";
}

export function CoachTodayPanel({
  todaySessions,
  activeAthletes,
  missingReadinessCount,
  missingNutritionCount,
}: {
  todaySessions: CalendarSession[];
  activeAthletes: number;
  missingReadinessCount: number;
  missingNutritionCount: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">Today</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Sessions and missing daily signals for active athletes.
          </p>
        </div>
        <span className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
          {activeAthletes} active
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href="/readiness"
          className={`rounded-xl border p-3 transition-colors hover:border-primary ${summaryTone(
            missingReadinessCount,
          )}`}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
            Missing readiness
          </p>
          <p className="mt-2 text-2xl font-black">{missingReadinessCount}</p>
        </Link>
        <Link
          href="/nutrition"
          className={`rounded-xl border p-3 transition-colors hover:border-primary ${summaryTone(
            missingNutritionCount,
          )}`}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
            Missing nutrition
          </p>
          <p className="mt-2 text-2xl font-black">{missingNutritionCount}</p>
        </Link>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-foreground">
            Today&apos;s sessions
          </p>
          <Link
            href="/sessions"
            className="text-xs font-extrabold text-primary-700 hover:text-primary-hover"
          >
            Manage
          </Link>
        </div>

        <div className="mt-3 grid gap-2">
          {todaySessions.length > 0 ? (
            todaySessions.map((session) => (
              <article
                key={session.id}
                className="rounded-xl bg-background p-3"
              >
                <p className="text-sm font-black text-foreground">
                  {session.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {formatTime(session.scheduled_at)} ·{" "}
                  {session.teamName ?? "No team"} ·{" "}
                  {session.location ?? "Location not set"}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
              No sessions scheduled for today.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function AthleteAttentionPanel({
  summaries,
}: {
  summaries: AthleteDashboardSummary[];
}) {
  const lowReadiness = summaries
    .filter(
      (summary) =>
        summary.latestReadiness !== null && summary.latestReadiness < 55,
    )
    .slice(0, 4);
  const highLoad = [...summaries]
    .sort((first, second) => second.sevenDayLoad - first.sevenDayLoad)
    .filter((summary) => summary.sevenDayLoad > 0)
    .slice(0, 4);

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-black text-foreground">Readiness watch</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Athletes currently reporting low readiness.
        </p>
        <div className="mt-4 grid gap-2">
          {lowReadiness.length > 0 ? (
            lowReadiness.map((summary) => (
              <article
                key={summary.athleteId}
                className="flex items-center justify-between gap-3 rounded-xl bg-background p-3"
              >
                <div>
                  <p className="text-sm font-black text-foreground">
                    {summary.athleteName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {summary.teamName ?? "No team"}
                  </p>
                </div>
                <span className="rounded-xl bg-warning-soft px-3 py-1.5 text-xs font-extrabold text-warning-foreground">
                  {summary.latestReadiness}
                </span>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
              No low-readiness alerts.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-black text-foreground">Load leaders</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Highest seven-day workload across tracked athletes.
        </p>
        <div className="mt-4 grid gap-2">
          {highLoad.length > 0 ? (
            highLoad.map((summary) => (
              <article
                key={summary.athleteId}
                className="flex items-center justify-between gap-3 rounded-xl bg-background p-3"
              >
                <div>
                  <p className="text-sm font-black text-foreground">
                    {summary.athleteName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {summary.teamName ?? "No team"}
                  </p>
                </div>
                <span className="rounded-xl bg-info-soft px-3 py-1.5 text-xs font-extrabold text-info-foreground">
                  {summary.sevenDayLoad}
                </span>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
              No workload recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
