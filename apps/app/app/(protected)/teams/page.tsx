import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getTeamsData } from "../../../lib/workspace";
import { CreateTeamForm } from "./_components/create-team-form";
import { TeamCardActions } from "./_components/team-card-actions";

function formatSportType(sportType: string) {
  return sportType
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPlan(plan: string | null | undefined) {
  return plan
    ? plan
        .split("_")
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ")
    : "Basic Team";
}

export default async function TeamsPage() {
  const { workspace, teams } = await getTeamsData();
  const athleteCount = teams.reduce((total, team) => total + team.athleteCount, 0);
  const weeklySessions = teams.reduce(
    (total, team) => total + (team.weekly_training_count ?? 0),
    0,
  );

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Team Operations"
        title="Teams"
        subtitle={`Manage team foundations for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/kutlama.png"
      />

      <div className="mt-4">
        <CreateTeamForm />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Teams"
          value={teams.length.toString()}
          helper="Active team records"
          icon="solar:users-group-rounded-bold"
        />
        <MetricCard
          label="Athletes"
          value={athleteCount.toString()}
          helper="Assigned across teams"
          icon="solar:user-id-bold"
          tone="secondary"
        />
        <MetricCard
          label="Weekly"
          value={weeklySessions.toString()}
          helper="Planned training count"
          icon="solar:calendar-mark-bold"
          tone="info"
        />
      </div>

      {teams.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {team.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {formatSportType(team.sport_type)}
                    {team.age_group ? ` · ${team.age_group}` : ""}
                    {team.level ? ` · ${team.level}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                    {formatPlan(team.entitlement?.plan)}
                  </div>
                  <TeamCardActions team={team} />
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <DetailStat label="Athletes" value={team.athleteCount} />
                <DetailStat
                  label="Weekly sessions"
                  value={team.weekly_training_count ?? 0}
                />
                <DetailStat
                  label="AI reports"
                  value={team.entitlement?.ai_reports_enabled ? "On" : "Off"}
                />
              </div>

              {team.season_goal ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {team.season_goal}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No teams loaded yet"
          description="The first team will be created during onboarding."
          icon="solar:users-group-rounded-bold"
        />
      )}
    </section>
  );
}
