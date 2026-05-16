import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { SettingsNotice } from "../_components/settings-notice";

export default function IntegrationsSettingsPage() {
  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Integrations"
        subtitle="Connect external tools and data sources to CoachOS."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <SettingsNotice
        title="Wearables and imports"
        body="Wearable provider links are managed from the Performance Data → Wearables page. Strava OAuth, CSV import and additional integrations will land here and in dedicated flows per the architecture docs."
      />
    </section>
  );
}
