import { listCoachingPackagesForWorkspace } from "../../../actions/coach-network-offers";
import {
  DashboardHero,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
import { CoachingPackagesManager } from "./_components/coaching-packages-manager";

export default async function CoachNetworkPackagesPage() {
  const packages = await listCoachingPackagesForWorkspace();
  const activeCount = packages.filter((item) => item.is_active).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Coaching packages"
        subtitle="Maintain reusable offer templates for faster, more consistent marketplace responses."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Packages"
          value={packages.length.toString()}
          helper="Saved templates"
          icon="solar:box-bold"
        />
        <MetricCard
          label="Active"
          value={activeCount.toString()}
          helper="Available for offers"
          icon="solar:check-circle-bold"
          tone="secondary"
        />
        <MetricCard
          label="Inactive"
          value={(packages.length - activeCount).toString()}
          helper="Hidden templates"
          icon="solar:archive-bold"
          tone="info"
        />
      </div>

      <CoachingPackagesManager initialPackages={packages} />
    </section>
  );
}
