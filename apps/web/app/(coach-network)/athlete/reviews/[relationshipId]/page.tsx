import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { listAthleteReviewOpportunities } from "../../../../actions/coach-network-reviews";
import { SubmitCoachReviewForm } from "../_components/submit-coach-review-form";

type AthleteReviewWritePageProps = {
  params: Promise<{ relationshipId: string }>;
};

export default async function AthleteReviewWritePage({
  params,
}: AthleteReviewWritePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect_url=/athlete/reviews");
  }

  const { relationshipId } = await params;
  const opportunities = await listAthleteReviewOpportunities();
  const match = opportunities.find(
    (item) => item.relationshipId === relationshipId,
  );

  if (!match || match.existingReview) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <Link
        href="/athlete/reviews"
        className="text-sm font-semibold text-primary hover:text-primary-hover"
      >
        Coach reviews
      </Link>

      <div className="mt-6">
        <SubmitCoachReviewForm
          relationshipId={relationshipId}
          coachName={match.coachProfile?.display_name ?? "your coach"}
        />
      </div>
    </main>
  );
}
