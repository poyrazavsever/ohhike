import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRemoteCoachingRelationshipDetail } from "../../../../actions/coach-network-programs";
import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
} from "../../../../../components/dashboard/dashboard-cards";
import { parseRelationshipCoachMetadata } from "../../../../../lib/coach-network/reviews";
import { AssignCoachingProgramForm } from "./_components/assign-coaching-program-form";
import { PrivateAthleteRatingForm } from "./_components/private-athlete-rating-form";

type RemoteAthleteDetailPageProps = {
  params: Promise<{ relationshipId: string }>;
};

function athleteLabel(
  athlete: {
    display_name: string | null;
    first_name: string;
    last_name: string | null;
    email: string | null;
  } | null,
) {
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

  const coachMetadata = parseRelationshipCoachMetadata(relationship.metadata);
  const displayName = athleteLabel(athlete);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <Link
        href="/coach-network/remote-athletes"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" className="size-4" />
        Remote athletes
      </Link>

      <div className="mt-4">
        <DashboardHero
          eyebrow="Coach Network"
          title={displayName}
          subtitle="Manage the active remote coaching relationship, program assignment and internal athlete assessment."
          mascotSrc="/maskotlar/hazirlik.png"
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat
          label="Relationship"
          value={relationship.status.replaceAll("_", " ")}
        />
        <DetailStat
          label="Payment"
          value={relationship.payment_status.replaceAll("_", " ")}
        />
        <DetailStat
          label="Adherence"
          value={
            adherence?.percent != null ? `${adherence.percent}%` : "Pending"
          }
        />
      </div>

      {activeAssignment ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
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
            {activeAssignment.starts_at} to {activeAssignment.ends_at}
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
        <EmptyStateCard
          title="No active program assigned"
          description="Assign a program after payment confirmation to start adherence tracking."
          icon="solar:calendar-bold"
        />
      )}

      {canAssignProgram ? (
        <AssignCoachingProgramForm relationshipId={relationship.id} />
      ) : (
        <p className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground">
          Confirm payment before assigning a program to this athlete.
        </p>
      )}

      <PrivateAthleteRatingForm
        relationshipId={relationship.id}
        initialRating={coachMetadata.private_athlete_rating}
        initialNote={coachMetadata.private_athlete_rating_note}
      />
    </section>
  );
}
