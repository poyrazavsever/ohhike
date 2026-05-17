import Link from "next/link";
import { notFound } from "next/navigation";

import { getRemoteCoachingRelationshipDetail } from "../../../../actions/coach-network-programs";
import { AssignCoachingProgramForm } from "./_components/assign-coaching-program-form";

type RemoteAthleteDetailPageProps = {
  params: Promise<{ relationshipId: string }>;
};

function athleteLabel(athlete: {
  display_name: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
} | null) {
  if (!athlete) {
    return "Athlete";
  }
  return (
    athlete.display_name ??
    [athlete.first_name, athlete.last_name].filter(Boolean).join(" ") ??
    athlete.email ??
    "Athlete"
  );
}

export default async function RemoteAthleteDetailPage({
  params,
}: RemoteAthleteDetailPageProps) {
  const { relationshipId } = await params;
  const detail = await getRemoteCoachingRelationshipDetail(relationshipId);

  if (!detail) {
    notFound();
  }

  const { relationship, athlete, activeAssignment, adherence } = detail;
  const canAssignProgram =
    relationship.status === "active" &&
    relationship.payment_status !== "pending_manual";

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Link
        href="/coach-network/remote-athletes"
        className="text-sm font-semibold text-primary hover:text-primary-hover"
      >
        ← Remote athletes
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-extrabold text-foreground">
          {athleteLabel(athlete)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {relationship.status.replaceAll("_", " ")} · payment:{" "}
          {relationship.payment_status.replaceAll("_", " ")}
        </p>
      </header>

      {activeAssignment ? (
        <section className="mt-6 rounded-3xl border border-border bg-primary-soft/40 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Active program
          </h2>
          <p className="mt-2 text-lg font-extrabold text-foreground">
            {activeAssignment.title}
          </p>
          {activeAssignment.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeAssignment.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-muted-foreground">
            {activeAssignment.starts_at} → {activeAssignment.ends_at}
          </p>
          {adherence && adherence.percent !== null ? (
            <p className="mt-3 text-sm font-bold text-foreground">
              Adherence: {adherence.percent}% ({adherence.completedDays} /{" "}
              {adherence.totalDays} days)
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Adherence tracking starts once the program window begins.
            </p>
          )}
        </section>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          No active program assigned yet.
        </p>
      )}

      {canAssignProgram ? (
        <AssignCoachingProgramForm relationshipId={relationship.id} />
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Confirm payment before assigning a program to this athlete.
        </p>
      )}
    </main>
  );
}
