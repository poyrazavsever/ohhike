import { PageHeader } from "../../../components/layout/page-header";
import { getTeamsData } from "../../../lib/workspace";

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

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Teams"
        description={`Manage teams for ${workspace.organization.name}. Team CRUD will build on this list in the next phase.`}
      />

      {teams.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {teams.map((team) => (
            <article
              key={team.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {team.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {formatSportType(team.sport_type)}
                    {team.age_group ? ` · ${team.age_group}` : ""}
                    {team.level ? ` · ${team.level}` : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {formatPlan(team.entitlement?.plan)}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Athletes
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-foreground">
                    {team.athleteCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Weekly sessions
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-foreground">
                    {team.weekly_training_count ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    AI reports
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-foreground">
                    {team.entitlement?.ai_reports_enabled ? "On" : "Off"}
                  </p>
                </div>
              </div>

              {team.season_goal ? (
                <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                  {team.season_goal}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No teams loaded yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            The first team will be created during onboarding.
          </p>
        </div>
      )}
    </section>
  );
}
