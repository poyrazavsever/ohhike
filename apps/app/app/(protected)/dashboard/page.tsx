import {
  AchievementStrip,
  DashboardHero,
  MetricCard,
  ProgressCard,
  QuickActions,
} from "../../../components/dashboard/dashboard-cards";
import { getDashboardData } from "../../../lib/workspace";

function formatPlan(plan: string | undefined) {
  if (!plan) {
    return "Basic Team";
  }

  return plan
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function DashboardPage() {
  const { organization, membership, teams, athleteCount, entitlements } =
    await getDashboardData();

  const primaryTeam = teams[0];
  const primaryEntitlement = primaryTeam
    ? entitlements.find((entitlement) => entitlement.team_id === primaryTeam.id)
    : null;
  const planName = formatPlan(primaryEntitlement?.plan);
  const athleteCapacity = primaryEntitlement?.max_team_members ?? 3;
  const athleteProgress =
    athleteCapacity > 0
      ? Math.min(Math.round((athleteCount / athleteCapacity) * 100), 100)
      : 0;
  const teamProgress =
    teams.length > 0 ? Math.min(Math.round((teams.length / 3) * 100), 100) : 0;

  const metricCards = [
    {
      label: "Organization",
      value: organization.name,
      helper: `${membership.role.replaceAll("_", " ")} access`,
      icon: "solar:buildings-3-bold",
      tone: "primary" as const,
    },
    {
      label: "Teams",
      value: teams.length.toString(),
      helper: primaryTeam ? `Primary: ${primaryTeam.name}` : "No teams yet",
      icon: "solar:users-group-rounded-bold",
      tone: "info" as const,
    },
    {
      label: "Athletes",
      value: athleteCount.toString(),
      helper: "Tracked athlete profiles",
      icon: "solar:user-id-bold",
      tone: "secondary" as const,
    },
    {
      label: "Plan",
      value: planName,
      helper: primaryEntitlement?.ai_reports_enabled
        ? "AI reports enabled"
        : "AI reports disabled",
      icon: "solar:card-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-8 md:px-8">
      <DashboardHero
        eyebrow="Coach Workspace"
        title="Welcome back, let's move."
        subtitle={`Ready to coach ${organization.name} today? Your workspace is live and waiting for the next signal.`}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.4fr_0.8fr]">
        <div className="grid gap-4">
          <ProgressCard
            label="Athlete Capacity"
            value={athleteProgress}
            helper={`${athleteCount} / ${athleteCapacity} athletes`}
            icon="solar:user-heart-bold"
            footer="Keep roster data clean before increasing load and readiness analysis."
          />
          <ProgressCard
            label="Workspace Setup"
            value={teamProgress}
            helper={`${teams.length} team records`}
            icon="solar:stars-bold"
            footer="Teams, athletes and sessions are now ready for richer coaching workflows."
          />
        </div>

        <div className="flex min-h-96 flex-col items-center justify-center rounded-4xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary-soft text-primary-700">
            <span className="text-3xl font-black">O</span>
          </div>
          <h2 className="mt-6 max-w-md text-4xl font-black tracking-tight text-foreground">
            Discover Today&apos;s Coaching Route
          </h2>
          <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
            Review athlete signals, plan training blocks and keep the team memory
            fresh from one focused workspace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/sessions"
              className="inline-flex items-center rounded-2xl bg-primary px-8 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Plan Session
            </a>
            <a
              href="/readiness"
              className="inline-flex items-center rounded-2xl border border-border px-8 py-3 text-sm font-black text-foreground transition-colors hover:border-primary hover:text-primary-700"
            >
              Log Wellness
            </a>
          </div>
        </div>

        <QuickActions
          actions={[
            {
              label: "Create session",
              href: "/sessions",
              icon: "solar:add-circle-bold",
            },
            {
              label: "Log readiness",
              href: "/readiness",
              icon: "solar:pulse-2-bold",
            },
            {
              label: "View progress",
              href: "/load-recovery",
              icon: "solar:chart-2-bold",
            },
          ]}
        />
      </div>

      <div className="mt-6">
        <AchievementStrip
          achievements={[
            {
              label: `${teams.length} Teams`,
              helper: "Workspace ready",
              icon: "solar:users-group-rounded-bold",
              tone: "primary",
            },
            {
              label: `${athleteCount} Athletes`,
              helper: "Profiles tracked",
              icon: "solar:user-id-bold",
              tone: "secondary",
            },
            {
              label: planName,
              helper: "Current plan",
              icon: "solar:card-bold",
              tone: "info",
            },
            {
              label: primaryEntitlement?.ai_reports_enabled ? "AI On" : "AI Off",
              helper: "Report access",
              icon: "solar:document-add-bold",
              tone: "warning",
            },
          ]}
        />
      </div>
    </section>
  );
}
