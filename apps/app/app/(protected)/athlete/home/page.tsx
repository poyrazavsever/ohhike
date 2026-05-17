import Link from "next/link";

import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
import { getAthleteHomeData } from "../../../../lib/athlete-portal";
import { TodayProgramCard } from "./_components/today-program-card";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function AthleteHomePage() {
  const {
    portal,
    latestCheckin,
    latestNutrition,
    upcomingSessions,
    sevenDayLoad,
    todayProgram,
  } = await getAthleteHomeData();

  const displayName =
    portal.athlete.display_name ??
    ([portal.athlete.first_name, portal.athlete.last_name]
      .filter(Boolean)
      .join(" ") ||
      "Athlete");

  const metricCards = [
    {
      label: "Readiness",
      value: latestCheckin?.readiness_score?.toString() ?? "—",
      helper: latestCheckin
        ? `Last check-in ${formatDay(latestCheckin.checkin_date)}`
        : "No check-in yet",
      icon: "solar:pulse-2-bold",
      tone: "info" as const,
    },
    {
      label: "7D load",
      value: sevenDayLoad.toString(),
      helper: "Minutes × RPE",
      icon: "solar:chart-2-bold",
      tone: "secondary" as const,
    },
    {
      label: "Hydration",
      value: latestNutrition?.hydration_score?.toString() ?? "—",
      helper: latestNutrition
        ? `Log ${formatDay(latestNutrition.log_date)}`
        : "No nutrition log",
      icon: "solar:cup-hot-bold",
      tone: "warning" as const,
    },
    {
      label: "Upcoming",
      value: upcomingSessions.length.toString(),
      helper: "Scheduled sessions",
      icon: "solar:calendar-mark-bold",
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={portal.teamName ?? portal.workspace.organization.name}
        title={`Welcome, ${displayName}`}
        subtitle="Your daily readiness, nutrition and upcoming sessions in one place."
        mascotSrc="/maskotlar/kosu.png"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {todayProgram ? (
        <div className="mt-6">
          <TodayProgramCard {...todayProgram} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-foreground">
              Quick actions
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            <Link
              href="/athlete/check-in"
              className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
            >
              Submit daily check-in
            </Link>
            <Link
              href="/athlete/nutrition"
              className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
            >
              Log nutrition
            </Link>
            <Link
              href="/athlete/training"
              className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
            >
              Log personal training
            </Link>
            <Link
              href="/athlete/profile"
              className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
            >
              View my profile
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">
            Upcoming sessions
          </p>
          {upcomingSessions.length === 0 ? (
            <EmptyStateCard
              title="No sessions scheduled"
              description="Your coach will add team sessions here when they are planned."
              icon="solar:calendar-mark-bold"
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingSessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <p className="text-sm font-extrabold text-foreground">
                    {session.title}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {formatDate(session.scheduled_at)} · {session.type}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
