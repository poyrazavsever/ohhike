import { listRemoteAthletesWithProgramAdherence } from "../../../actions/coach-network-programs";
import {
  DashboardHero,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
import { RemoteAthletesList } from "./_components/remote-athletes-list";

export default async function CoachNetworkRemoteAthletesPage() {
  const rows = await listRemoteAthletesWithProgramAdherence();
  const activeCount = rows.filter((row) => row.status === "active").length;
  const pendingPaymentCount = rows.filter(
    (row) => row.payment_status === "pending_manual",
  ).length;
  const assignedCount = rows.filter((row) => row.activeAssignment).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Remote athletes"
        subtitle="Confirm payments, assign programs and track adherence for athletes who accepted your offers."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Remote athletes"
          value={rows.length.toString()}
          helper={`${activeCount} active relationships`}
          icon="solar:users-group-rounded-bold"
        />
        <MetricCard
          label="Pending payment"
          value={pendingPaymentCount.toString()}
          helper="Need manual confirmation"
          icon="solar:wallet-money-bold"
          tone="warning"
        />
        <MetricCard
          label="Programs"
          value={assignedCount.toString()}
          helper="Currently assigned"
          icon="solar:calendar-bold"
          tone="secondary"
        />
      </div>

      <RemoteAthletesList rows={rows} />
    </section>
  );
}
