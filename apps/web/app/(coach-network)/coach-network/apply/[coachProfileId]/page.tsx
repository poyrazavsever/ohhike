import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getPublicCoachProfileForApply } from "../../../../../lib/coach-network/public-queries";
import { CoachApplicationForm } from "./_components/application-form";

type ApplyPageProps = {
  params: Promise<{ coachProfileId: string }>;
  searchParams: Promise<{ package?: string }>;
};

export default async function ApplyToCoachPage({
  params,
  searchParams,
}: ApplyPageProps) {
  const { coachProfileId } = await params;
  const { package: packageId } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect(
      `/login?redirect_url=${encodeURIComponent(`/coach-network/apply/${coachProfileId}`)}`,
    );
  }

  const coach = await getPublicCoachProfileForApply(coachProfileId);

  if (!coach) {
    notFound();
  }

  if (!coach.isAcceptingClients) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 md:px-8">
        <h1 className="text-2xl font-extrabold text-foreground">
          Applications closed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {coach.displayName} is not accepting new clients right now.
        </p>
        <Link
          href={`/coach-network/coaches/${coach.slug}`}
          className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Back to profile
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 md:px-8">
      <Link
        href={`/coach-network/coaches/${coach.slug}`}
        className="text-sm font-semibold text-primary hover:text-primary-hover"
      >
        Back to {coach.displayName}
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold text-foreground">
        Apply for coaching
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your application and consents are shared only with this coach.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <CoachApplicationForm
          coachProfileId={coach.id}
          coachName={coach.displayName}
          packages={coach.packages}
          defaultPackageId={packageId ?? null}
        />
      </div>
    </main>
  );
}
