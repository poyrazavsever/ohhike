import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getAthletePortalContext } from "../../../../lib/athlete-portal";
import { AthleteSelfNutritionForm } from "../_components/athlete-portal-forms";

export default async function AthleteNutritionPage() {
  const { athlete, teamName, workspace } = await getAthletePortalContext();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={teamName ?? workspace.organization.name}
        title="Nutrition log"
        subtitle="Track hydration, meals and supplements for your coaching staff."
        mascotSrc="/maskotlar/uykuu.png"
      />

      <AthleteSelfNutritionForm athleteId={athlete.id} />
    </section>
  );
}
