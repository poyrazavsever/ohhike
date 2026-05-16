import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getAthleteOnboardingPageData } from "../../../../lib/athlete-portal";
import { AthleteOnboardingForm } from "../_components/athlete-portal-forms";

export default async function AthleteOnboardingPage() {
  const { workspace, athlete, teamName } = await getAthleteOnboardingPageData();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={teamName ?? workspace.organization.name}
        title="Complete your athlete profile"
        subtitle="Confirm your details so your coach sees accurate roster information."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      {!athlete ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6">
          <p className="text-sm font-extrabold text-foreground">
            No profile linked yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Open the invite link from your coach and connect it to this account,
            then return here to finish setup.
          </p>
        </div>
      ) : (
        <div className="mt-6 max-w-3xl rounded-3xl border border-border bg-card p-6">
          <AthleteOnboardingForm
            initial={{
              firstName: athlete.first_name ?? "",
              lastName: athlete.last_name ?? "",
              phone: athlete.phone ?? "",
              position: athlete.position ?? "",
              dominantSide: athlete.dominant_side ?? "",
            }}
          />
        </div>
      )}
    </section>
  );
}
