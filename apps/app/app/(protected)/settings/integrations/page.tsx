import Link from "next/link";

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
        body="For MVP, register wearable connections manually on the Wearables page. Strava OAuth and CSV import are planned after the first production release."
      />

      <div className="mt-4">
        <Link
          href="/wearables"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Open Wearables
        </Link>
      </div>
    </section>
  );
}
