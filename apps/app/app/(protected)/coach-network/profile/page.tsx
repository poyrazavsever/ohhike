import { getCoachMarketplaceProfileForWorkspace } from "../../../actions/coach-network";
import { getPrimaryTeamEntitlement } from "../../../../lib/billing/entitlements";
import { getMarketingUrl } from "../../../../lib/marketing-url";
import { getCurrentWorkspace } from "../../../../lib/workspace";
import { CoachMarketplaceProfileForm } from "./_components/coach-marketplace-profile-form";

export default async function CoachNetworkProfilePage() {
  const workspace = await getCurrentWorkspace();
  const entitlement = await getPrimaryTeamEntitlement(workspace.organization.id);
  const profile = await getCoachMarketplaceProfileForWorkspace();

  const canPublish =
    entitlement.plan === "pro_team" || entitlement.plan === "pro_plus_team";

  const publicProfileUrl =
    profile?.is_public && profile.slug
      ? getMarketingUrl(`/coach-network/coaches/${profile.slug}`)
      : null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">
        Marketplace profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Publish your coaching profile on the OhHike find-a-coach directory. Athletes
        discover you on the marketing site and apply from there.
      </p>

      <CoachMarketplaceProfileForm
        initialProfile={profile}
        organizationName={workspace.organization.name}
        publicProfileUrl={publicProfileUrl}
        canPublish={canPublish}
      />
    </main>
  );
}
