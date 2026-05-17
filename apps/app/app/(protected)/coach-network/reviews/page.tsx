import { listCoachReviewsForWorkspace } from "../../../actions/coach-network-reviews";
import { getCoachMarketplaceProfileForWorkspace } from "../../../actions/coach-network";
import { getCoachReputationScore } from "../../../../lib/coach-network/reviews";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import {
  DashboardHero,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
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
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Reviews and reputation"
        subtitle="Moderate athlete reviews and monitor how public trust is represented in the marketplace."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Reputation score"
          value={`${reputationScore > 0 ? "+" : ""}${reputationScore}`}
          helper="Marketplace signal"
          icon="solar:star-bold"
        />
        <MetricCard
          label="Public rating"
          value={profile?.average_rating?.toFixed(1) ?? "-"}
          helper={`${reviews.length} review records`}
          icon="solar:medal-ribbon-star-bold"
          tone="secondary"
        />
        <MetricCard
          label="Reported"
          value={reportedCount.toString()}
          helper="Need moderation"
          icon="solar:flag-bold"
          tone="warning"
        />
      </div>

      <CoachReviewsManager reviews={reviews} />
    </section>
  );
}
