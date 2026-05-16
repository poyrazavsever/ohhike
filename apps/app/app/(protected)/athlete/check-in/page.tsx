import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getAthletePortalContext } from "../../../../lib/athlete-portal";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import { AthleteSelfCheckinForm } from "../_components/athlete-portal-forms";

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function AthleteCheckInPage() {
  const { athlete, teamName, workspace } = await getAthletePortalContext();

  const supabase = createSupabaseAdminClient();
  const { data: latest } = await supabase
    .from("wellness_checkins")
    .select("checkin_date, readiness_score, fatigue")
    .eq("athlete_id", athlete.id)
    .order("checkin_date", { ascending: false })
    .limit(1)
    .maybeSingle();

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
          Last saved {formatDay(latest.checkin_date)}
          {latest.readiness_score != null
            ? ` · readiness ${latest.readiness_score}`
            : ""}
        </p>
      ) : null}

      <AthleteSelfCheckinForm athleteId={athlete.id} />
    </section>
  );
}
