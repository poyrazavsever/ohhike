import { listCoachReviewsForWorkspace } from "../../../actions/coach-network-reviews";
import { getCoachMarketplaceProfileForWorkspace } from "../../../actions/coach-network";
import { getCoachReputationScore } from "../../../../lib/coach-network/reviews";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import { CoachReviewsManager } from "./_components/coach-reviews-manager";

export default async function CoachNetworkReviewsPage() {
  const [reviews, profile] = await Promise.all([
    listCoachReviewsForWorkspace(),
    getCoachMarketplaceProfileForWorkspace(),
  ]);

  let reputationScore = 0;
  if (profile?.id) {
    const supabase = createSupabaseAdminClient();
    reputationScore = await getCoachReputationScore(supabase, profile.id);
  }

  const reportedCount = reviews.filter((r) => r.metadataParsed.reported).length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Reviews & reputation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Moderate public athlete reviews and track your marketplace reputation score.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <dt className="text-xs font-bold uppercase text-muted-foreground">
            Reputation score
          </dt>
          <dd className="mt-1 text-2xl font-extrabold text-foreground">
            {reputationScore > 0 ? "+" : ""}
            {reputationScore}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <dt className="text-xs font-bold uppercase text-muted-foreground">
            Public rating
          </dt>
          <dd className="mt-1 text-2xl font-extrabold text-foreground">
            {profile?.average_rating?.toFixed(1) ?? "—"}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <dt className="text-xs font-bold uppercase text-muted-foreground">Reported</dt>
          <dd className="mt-1 text-2xl font-extrabold text-foreground">{reportedCount}</dd>
        </div>
      </dl>

      <CoachReviewsManager reviews={reviews} />
    </main>
  );
}
