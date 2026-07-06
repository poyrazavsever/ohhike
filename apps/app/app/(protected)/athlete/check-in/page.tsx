import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getAthletePortalContext } from "../../../../lib/athlete-portal";
import { auth } from "@clerk/nextjs/server";
import { AthleteSelfCheckinForm } from "../_components/athlete-portal-forms";

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function AthleteCheckInPage() {
  const { athlete, teamName, workspace } = await getAthletePortalContext();

  const { getToken } = await auth();
  const token = await getToken();

  let latest = null;
  try {
    const res = await fetch(`http://localhost:3002/api/v1/daily-data/${athlete.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.wellness && data.wellness.length > 0) {
        latest = data.wellness[0];
      }
    }
  } catch (e) {
    console.error("Failed to fetch wellness data");
  }

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={teamName ?? workspace.organization.name}
        title="Daily check-in"
        subtitle="Log sleep, soreness and mood before training."
        mascotSrc="/maskotlar/uykuu.png"
      />

      {latest ? (
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Last saved {formatDay(latest.date)}
          {latest.readiness_score != null
            ? ` · readiness ${latest.readiness_score}`
            : ""}
        </p>
      ) : null}

      <AthleteSelfCheckinForm athleteId={athlete.id} />
    </section>
  );
}
