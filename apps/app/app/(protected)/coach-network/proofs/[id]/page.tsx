import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getTrainingProofDetail } from "../../../../actions/coach-network-proofs";
import { ProofReviewActions } from "../_components/proof-review-actions";
import { ProofThreadPanel } from "../../../athlete/proofs/_components/proof-thread-panel";

type CoachProofDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function CoachProofDetailPage({
  params,
}: CoachProofDetailPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const detail = await getTrainingProofDetail(id);

  if (!detail || !detail.canReview) {
    notFound();
  }

  const { proof, athlete, media, messages } = detail;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Link
        href="/coach-network/proofs"
        className="text-sm font-semibold text-primary hover:text-primary-hover"
      >
        ← Proof reviews
      </Link>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {formatStatus(proof.status)}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">{proof.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {athleteLabel(athlete)} · {proof.proof_date}
        </p>
      </header>

      {proof.notes ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
          {proof.notes}
        </p>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {media.map((item) => {
            const isVideo = item.path.match(/\.(mp4|mov|webm)$/i);
            return (
              <a
                key={item.path}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border border-border bg-card"
              >
                {isVideo ? (
                  <video src={item.url} controls className="h-48 w-full bg-black" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt="Training proof"
                    className="h-48 w-full object-cover"
                  />
                )}
              </a>
            );
          })}
        </div>
      ) : null}

      <ProofReviewActions proofId={proof.id} currentStatus={proof.status} />

      <ProofThreadPanel
        proofId={proof.id}
        messages={messages}
        currentUserId={userId}
      />
    </main>
  );
}
