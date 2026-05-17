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
  const profileSignals = [
    profile?.headline,
    profile?.bio,
    profile?.intro_video_url,
    profile?.training_philosophy,
    profile?.featured_result,
    profile?.specialties?.length,
    profile?.languages?.length,
    profile?.pricing_display,
  ].filter(Boolean).length;
  const profileStrength = Math.round((profileSignals / 8) * 100);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Marketplace profile"
        subtitle="Publish a clear coaching profile athletes can discover from Find a coach."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="grid gap-2 md:grid-cols-3">
            <DetailStat
              label="Organization"
              value={workspace.organization.name}
            />
            <DetailStat
              label="Visibility"
              value={profile?.is_public ? "Published" : "Draft"}
            />
            <DetailStat
              label="Client status"
              value={profile?.is_accepting_clients ? "Accepting" : "Paused"}
            />
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-muted-foreground">
            Keep the public profile specific, evidence-led and current. Athletes
            should understand who you coach, how you work and what to do next
            without leaving the page.
          </p>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-black text-foreground">Profile strength</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Public-facing fields currently filled.
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <span className="text-3xl font-black text-primary-700">
              {profileStrength}%
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {profileSignals} / 8 signals
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-background">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
        </aside>
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
