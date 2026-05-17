"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewTrainingProof } from "../../../../actions/coach-network-proofs";
import type { TrainingProofStatus } from "../../../../../lib/database.types";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function ProofReviewActions({
  proofId,
  currentStatus,
}: {
  proofId: string;
  currentStatus: TrainingProofStatus;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const awaitingReview = currentStatus === "pending";

  function review(
    status: Extract<TrainingProofStatus, "approved" | "needs_revision" | "rejected">,
  ) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await reviewTrainingProof({
        proofId,
        status,
        feedback,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        status === "approved"
          ? "Proof approved. Program adherence updated for that date."
          : `Marked as ${status.replaceAll("_", " ")}.`,
      );
      router.refresh();
    });
  }

  if (!awaitingReview) {
    return (
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        Review complete: {currentStatus.replaceAll("_", " ")}.
      </p>
    );
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Review proof
      </h2>
      <textarea
        className={`${fieldClassName()} min-h-24`}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback for the athlete (posted to the thread)."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => review("approved")}
          className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => review("needs_revision")}
          className="rounded-full border border-border px-4 py-2 text-xs font-extrabold hover:bg-muted disabled:opacity-60"
        >
          Needs revision
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => review("rejected")}
          className="rounded-full bg-destructive px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
