import { PageHeader } from "../../../components/layout/page-header";
import { getAthletesData } from "../../../lib/workspace";
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

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Athletes"
        description={`Track athlete profiles for ${workspace.organization.name}. Claim status, readiness and invite flows will be added on top of this list.`}
      />

      <CreateAthleteForm teams={teams} />

      {athletes.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Athlete</span>
            <span>Team</span>
            <span>Status</span>
            <span>Claim</span>
          </div>
          <div className="divide-y divide-border">
            {athletes.map((athlete) => (
              <article
                key={athlete.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-extrabold text-foreground">
                    {athlete.number ? `#${athlete.number} · ` : ""}
                    {getAthleteName(athlete.first_name, athlete.last_name)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {athlete.position ?? "Position not set"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {athlete.teamName ?? "No team"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatStatus(athlete.status)}
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {athlete.user_id ? "Claimed" : "Not invited"}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No athletes loaded yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add athletes during onboarding or from this page in the next phase.
          </p>
        </div>
      )}
    </section>
  );
}
