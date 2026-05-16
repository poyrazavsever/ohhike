import { PageHeader } from "../../../components/layout/page-header";
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

  const cards = [
    {
      label: "Organization",
      value: organization.name,
      helper: `${membership.role.replaceAll("_", " ")} access`,
    },
    {
      label: "Teams",
      value: teams.length.toString(),
      helper: primaryTeam ? `Primary: ${primaryTeam.name}` : "No teams yet",
    },
    {
      label: "Athletes",
      value: athleteCount.toString(),
      helper: "Tracked athlete profiles",
    },
    {
      label: "Plan",
      value: formatPlan(primaryEntitlement?.plan),
      helper: primaryEntitlement?.ai_reports_enabled
        ? "AI reports enabled"
        : "AI reports disabled",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Coach Workspace"
        title="Coach Dashboard"
        description={`Live overview for ${organization.name}. Readiness, sessions and AI coaching context will build on this foundation.`}
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

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="text-sm font-extrabold text-foreground">
          Next recommended action
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Add more athletes or create your first training session once team
          operations are enabled in the next phase.
        </p>
      </div>
    </section>
  );
}
