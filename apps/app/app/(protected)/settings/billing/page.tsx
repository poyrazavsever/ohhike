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
        title="Payments coming soon"
        body="CoachOS MVP runs without online checkout. Team plans (Basic / Pro / Pro Plus) are stored in the database for future gates. Clerk Billing and self-serve upgrades will ship after the first production release."
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
