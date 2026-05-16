import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { SettingsNotice } from "../_components/settings-notice";

export default function StaffSettingsPage() {
  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Staff"
        subtitle="Invite coaches and assign roles per organization. This module is not wired yet."
        mascotSrc="/maskotlar/kutlama.png"
      />

      <SettingsNotice
        title="Coming soon"
        body="Team staff invites, role changes (owner, admin, head coach, coach) and audit visibility will be added in line with UserFlows and RLS policies. Until then, use organization membership from onboarding and direct database tools if needed."
      />
    </section>
  );
}
