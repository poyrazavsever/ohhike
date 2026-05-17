import Link from "next/link";

import { listTrainingProofsForWorkspace } from "../../../actions/coach-network-proofs";
import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function athleteLabel(
  athlete: {
    display_name: string | null;
    first_name: string;
    last_name: string | null;
    email: string | null;
  } | null,
) {
  if (!athlete) {
    return "Athlete";
  }
  return (
    athlete.display_name ??
    [athlete.first_name, athlete.last_name].filter(Boolean).join(" ") ??
    athlete.email ??
    "Athlete"
  );
}

export default async function CoachNetworkProofsPage() {
  const proofs = await listTrainingProofsForWorkspace();
  const pendingCount = proofs.filter((p) => p.status === "pending").length;
  const approvedCount = proofs.filter((p) => p.status === "approved").length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Proof reviews"
        subtitle="Review remote athlete session media and convert approved proof into adherence progress."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Proofs"
          value={proofs.length.toString()}
          helper="Submitted overall"
          icon="solar:gallery-bold"
        />
        <MetricCard
          label="Pending"
          value={pendingCount.toString()}
          helper="Need review"
          icon="solar:inbox-bold"
          tone="warning"
        />
        <MetricCard
          label="Approved"
          value={approvedCount.toString()}
          helper="Counted for adherence"
          icon="solar:check-circle-bold"
          tone="secondary"
        />
      </div>

      {proofs.length === 0 ? (
        <EmptyStateCard
          title="No proofs submitted yet"
          description="Approved proof submissions will appear here once remote athletes start reporting sessions."
          icon="solar:gallery-bold"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.35fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Proof</span>
            <span>Athlete</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-border">
            {proofs.map((proof) => (
              <li key={proof.id}>
                <Link
                  href={`/coach-network/proofs/${proof.id}`}
                  className="grid gap-3 px-4 py-3 transition-colors hover:bg-background md:grid-cols-[1.35fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {proof.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {proof.proof_date}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {athleteLabel(proof.athlete)}
                  </p>
                  <p
                    className={
                      proof.status === "pending"
                        ? "text-xs font-extrabold uppercase tracking-[0.14em] text-warning-foreground"
                        : "text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground"
                    }
                  >
                    {formatStatus(proof.status)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
