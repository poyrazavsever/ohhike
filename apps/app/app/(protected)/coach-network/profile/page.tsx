import { getCoachMarketplaceProfileForWorkspace } from "../../../actions/coach-network";
import {
  DashboardHero,
  DetailStat,
} from "../../../../components/dashboard/dashboard-cards";
import { getPrimaryTeamEntitlement } from "../../../../lib/billing/entitlements";
import { getMarketingUrl } from "../../../../lib/marketing-url";
import { getCurrentWorkspace } from "../../../../lib/workspace";
import { CoachMarketplaceProfileForm } from "./_components/coach-marketplace-profile-form";

export default async function CoachNetworkProfilePage() {
  const workspace = await getCurrentWorkspace();
  const entitlement = await getPrimaryTeamEntitlement(
    workspace.organization.id,
  );
  const profile = await getCoachMarketplaceProfileForWorkspace();

  const canPublish =
    entitlement.plan === "pro_team" || entitlement.plan === "pro_plus_team";

  const publicProfileUrl =
    profile?.is_public && profile.slug
      ? getMarketingUrl(`/coach-network/coaches/${profile.slug}`)
      : null;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Marketplace profile"
        subtitle="Publish a clear coaching profile athletes can discover from Find a coach."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat label="Organization" value={workspace.organization.name} />
        <DetailStat
          label="Visibility"
          value={profile?.is_public ? "Published" : "Draft"}
        />
        <DetailStat
          label="Client status"
          value={profile?.is_accepting_clients ? "Accepting" : "Paused"}
        />
      </div>

      <div className="mt-4">
        <CoachMarketplaceProfileForm
          initialProfile={profile}
          organizationName={workspace.organization.name}
          publicProfileUrl={publicProfileUrl}
          canPublish={canPublish}
        />
      </div>
    </section>
  );
}
