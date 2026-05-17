import Link from "next/link";

import { listTrainingProofsForWorkspace } from "../../../actions/coach-network-proofs";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function athleteLabel(athlete: {
  display_name: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
} | null) {
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

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Proof reviews</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review remote athlete session media. Approving a proof marks that program day
        complete for adherence.
        {pendingCount > 0 ? ` ${pendingCount} pending.` : ""}
      </p>

      {proofs.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
          No proofs submitted yet.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
          {proofs.map((proof) => (
            <li key={proof.id}>
              <Link
                href={`/coach-network/proofs/${proof.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-extrabold text-foreground">{proof.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {athleteLabel(proof.athlete)} · {proof.proof_date}
                  </p>
                </div>
                <p
                  className={
                    proof.status === "pending"
                      ? "text-xs font-bold uppercase text-amber-700"
                      : "text-xs font-bold uppercase text-muted-foreground"
                  }
                >
                  {formatStatus(proof.status)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
