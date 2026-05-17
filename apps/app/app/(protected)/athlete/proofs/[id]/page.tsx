import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getTrainingProofDetail } from "../../../../actions/coach-network-proofs";
import { ProofThreadPanel } from "../_components/proof-thread-panel";

type AthleteProofDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AthleteProofDetailPage({
  params,
}: AthleteProofDetailPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const detail = await getTrainingProofDetail(id);

  if (!detail || !detail.isAthlete) {
    notFound();
  }

  const { proof, media, messages } = detail;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/athlete/proofs"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Training proofs
        </Link>

        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {formatStatus(proof.status)}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground">{proof.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Session date: {proof.proof_date}</p>
        </header>

        {proof.notes ? (
          <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
            {proof.notes}
          </p>
        ) : null}

        {proof.coach_feedback ? (
          <p className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/50 p-4 text-sm leading-6 text-foreground">
            <span className="font-bold">Coach feedback: </span>
            {proof.coach_feedback}
          </p>
        ) : null}

        {media.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {media.map((item) => (
              <a
                key={item.path}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt="Training proof"
                  className="h-48 w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}

        <ProofThreadPanel
          proofId={proof.id}
          messages={messages}
          currentUserId={userId}
        />
      </div>
    </section>
  );
}
