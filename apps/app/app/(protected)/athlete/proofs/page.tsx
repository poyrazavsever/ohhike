import Link from "next/link";

import { listTrainingProofsForAthlete } from "../../../actions/coach-network-proofs";
import { SubmitProofForm } from "./_components/submit-proof-form";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AthleteProofsPage() {
  const proofs = await listTrainingProofsForAthlete();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold text-foreground">Training proofs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Share session photos or videos with your remote coach for review.
        </p>

        <div className="mt-6">
          <SubmitProofForm />
        </div>

        <h2 className="mt-10 text-lg font-extrabold text-foreground">Your submissions</h2>
        {proofs.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No proofs yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {proofs.map((proof) => (
              <li key={proof.id}>
                <Link
                  href={`/athlete/proofs/${proof.id}`}
                  className="block rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-foreground">{proof.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {proof.proof_date} · {formatStatus(proof.status)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">View →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
