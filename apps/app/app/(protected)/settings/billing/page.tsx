import {
  DashboardHero,
  DetailStat,
} from "../../../../components/dashboard/dashboard-cards";
import { SettingsNotice } from "../_components/settings-notice";

export default function BillingSettingsPage() {
  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Billing"
        subtitle="Team-level Basic, Pro and Pro Plus entitlements are enforced from team billing records."
        mascotSrc="/maskotlar/harita.png"
      />

      <SettingsNotice
        title="Current model"
        body="Billing is team-based. Feature gates read from team_billing_entitlements for the active team. Clerk Billing webhooks and plan upgrades will extend this page in a later phase."
      />

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <DetailStat
          label="Entitlements source"
          value="team_billing_entitlements"
        />
        <DetailStat label="Next step" value="Clerk Billing + sync" />
      </div>
    </section>
  );
}
