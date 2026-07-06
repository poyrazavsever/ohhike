import {
  AchievementStrip,
  DashboardHero,
  MetricCard,
  ProgressCard,
  QuickActions,
} from "../../../components/dashboard/dashboard-cards";
import {
  DashboardAgenda,
  DashboardMiniCalendar,
} from "../../../components/dashboard/dashboard-calendar";
import { CoachTodayPanel } from "../../../components/dashboard/dashboard-operations";
import {
  getCalendarData,
  getCoachDashboardAttentionData,
  getDashboardData,
} from "../../../lib/workspace";

export default async function DashboardPage() {
  const { organization, membership, teams, athleteCount } =
    await getDashboardData();
  const { sessions } = await getCalendarData();
  const { summary } = await getCoachDashboardAttentionData();

  const primaryTeam = teams[0];
  const athleteCapacity = 30; // Hardcoded fallback for MVP
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
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Workspace"
        title="Welcome back, let's move."
        subtitle={`Ready to coach ${organization.name} today? Your workspace is live and waiting for the next signal.`}
        mascotSrc="/maskotlar/harita.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(28rem,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="grid gap-3">
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

        <CoachTodayPanel {...summary} />

        <div className="grid gap-3">
          <DashboardMiniCalendar sessions={sessions} />
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
            ]}
          />
        </div>
      </div>

      <div className="mt-4">
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
          ]}
        />
      </div>

      <div className="mt-4">
        <DashboardAgenda sessions={sessions} />
      </div>
    </section>
  );
}
