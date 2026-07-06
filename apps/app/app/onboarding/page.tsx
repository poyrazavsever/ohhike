const auth = () => ({ userId: "temp" }); const currentUser = () => ({});
import { redirect } from "next/navigation";

import { hasActiveOrganizationMembership } from "../../lib/organization-membership";
import { OnboardingStepper } from "./_components/onboarding-stepper";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const hasMembership = await hasActiveOrganizationMembership(userId);

  if (hasMembership) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-svh bg-background px-5 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl items-center">
        <OnboardingStepper />
      </div>
    </main>
  );
}

