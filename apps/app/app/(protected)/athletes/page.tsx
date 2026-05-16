import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getAthletesData } from "../../../lib/workspace";
import { AthleteRowActions } from "./_components/athlete-row-actions";
import { CreateAthleteForm } from "./_components/create-athlete-form";

function getAthleteName(firstName: string, lastName: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

function formatStatus(status: string | null) {
  return status
    ? status
        .split("_")
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ")
    : "Active";
}

export default async function AthletesPage() {
  const { workspace, athletes, teams } = await getAthletesData();
  const claimedCount = athletes.filter((athlete) => athlete.user_id).length;
  const invitedCount = athletes.length - claimedCount;
  const activeCount = athletes.filter(
    (athlete) => !athlete.status || athlete.status === "active",
  ).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Team Operations"
        title="Athletes"
        subtitle={`Track athlete profiles, roster status and claim readiness for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/kosu.png"
      />

      <div className="mt-4">
        <CreateAthleteForm teams={teams} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Athletes"
          value={athletes.length.toString()}
          helper="Profiles in roster"
          icon="solar:user-id-bold"
        />
        <MetricCard
          label="Claimed"
          value={claimedCount.toString()}
          helper={`${invitedCount} not invited yet`}
          icon="solar:user-check-rounded-bold"
          tone="secondary"
        />
        <MetricCard
          label="Active"
          value={activeCount.toString()}
          helper={`${teams.length} teams available`}
          icon="solar:heart-pulse-bold"
          tone="info"
        />
      </div>

      {athletes.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Athlete</span>
            <span>Team</span>
            <span>Status</span>
            <span>Claim</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-border">
            {athletes.map((athlete) => (
              <article
                key={athlete.id}
                className="grid gap-3 px-4 py-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:gap-4"
              >
                <div>
                  <p className="text-sm font-black text-foreground">
                    {athlete.number ? `#${athlete.number} · ` : ""}
                    {getAthleteName(athlete.first_name, athlete.last_name)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {athlete.position ?? "Position not set"}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {athlete.teamName ?? "No team"}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {formatStatus(athlete.status)}
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {athlete.user_id ? "Claimed" : "Not invited"}
                </p>
                <AthleteRowActions athlete={athlete} teams={teams} />
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyStateCard
          title="No athletes loaded yet"
          description="Add athletes during onboarding or directly from this page."
          icon="solar:user-id-bold"
        />
      )}
    </section>
  );
}
