import Link from "next/link";

import { listTrainingProofsForAthlete } from "../../../actions/coach-network-proofs";
import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";
import { SubmitProofForm } from "./_components/submit-proof-form";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AthleteProofsPage() {
  const proofs = await listTrainingProofsForAthlete();
  const pendingCount = proofs.filter(
    (proof) => proof.status === "pending",
  ).length;
  const approvedCount = proofs.filter(
    (proof) => proof.status === "approved",
  ).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Remote coaching"
        title="Training proofs"
        subtitle="Share session photos or videos with your coach and track the review state of each submission."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Submissions"
          value={proofs.length.toString()}
          helper="Total proofs"
          icon="solar:gallery-bold"
        />
        <MetricCard
          label="Pending"
          value={pendingCount.toString()}
          helper="Waiting for coach review"
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

      <div className="mt-4">
        <SubmitProofForm />
      </div>

      <h2 className="mt-4 text-sm font-black text-foreground">
        Your submissions
      </h2>
      {proofs.length === 0 ? (
        <EmptyStateCard
          title="No proofs yet"
          description="Submitted sessions will appear here after your first upload."
          icon="solar:gallery-bold"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.35fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Proof</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-border">
            {proofs.map((proof) => (
              <li key={proof.id}>
                <Link
                  href={`/athlete/proofs/${proof.id}`}
                  className="grid gap-3 px-4 py-3 transition-colors hover:bg-background md:grid-cols-[1.35fr_1fr_auto] md:items-center md:gap-4"
                >
                  <p className="text-sm font-black text-foreground">
                    {proof.title}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {proof.proof_date}
                  </p>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
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
