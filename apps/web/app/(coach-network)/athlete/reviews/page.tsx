import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { listAthleteReviewOpportunities } from "../../../actions/coach-network-reviews";

export default async function AthleteReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect_url=/athlete/reviews");
  }

  const { submitted } = await searchParams;
  const opportunities = await listAthleteReviewOpportunities();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Coach reviews</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Share feedback for coaches you worked with through OhHike remote coaching.
      </p>

      {submitted ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Review submitted. Thank you for helping other athletes choose a coach.
        </p>
      ) : null}

      {opportunities.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No coaches ready for review yet. Complete onboarding with a coach and confirm
          payment first.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {opportunities.map((item) => (
            <li
              key={item.relationshipId}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold text-foreground">
                    {item.coachProfile?.display_name ?? "Coach"}
                  </p>
                  {item.existingReview ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      You rated {item.existingReview.rating}/5 on{" "}
                      {item.existingReview.created_at
                        ? new Date(item.existingReview.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready for your review
                    </p>
                  )}
                </div>
                {item.coachProfile?.slug ? (
                  <Link
                    href={`/coach-network/coaches/${item.coachProfile.slug}`}
                    className="text-sm font-semibold text-primary"
                  >
                    View profile
                  </Link>
                ) : null}
              </div>
              {!item.existingReview ? (
                <Link
                  href={`/athlete/reviews/${item.relationshipId}`}
                  className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white"
                >
                  Write review
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
