import { auth } from "@clerk/nextjs/server";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { hasActiveOrganizationMembership } from "../../lib/organization-membership";

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
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-4xl items-center">
        <section className="w-full rounded-4xl border border-border bg-card p-6 md:p-10">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-700">
            <Icon icon="solar:stars-bold" className="size-6" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
            Onboarding
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-foreground md:text-4xl">
            Takım iskeletini kurmaya hazırız
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Doctor Panda burada organizasyonunu, ilk takımını ve opsiyonel ilk
            sporcularını oluşturacak onboarding akışını yönetecek. Bir sonraki
            adımda bu ekranı gerçek stepper ve server action&apos;larla
            bağlayacağız.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {["Organization", "First team", "Athletes"].map((step) => (
              <div
                key={step}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <p className="text-sm font-bold text-foreground">{step}</p>
                <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
                  Planned for the next implementation step.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
