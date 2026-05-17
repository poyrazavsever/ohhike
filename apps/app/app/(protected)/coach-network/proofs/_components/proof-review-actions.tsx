"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewTrainingProof } from "../../../../actions/coach-network-proofs";
import type { TrainingProofStatus } from "../../../../../lib/database.types";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
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
    status: Extract<
      TrainingProofStatus,
      "approved" | "needs_revision" | "rejected"
    >,
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
      <p className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground">
        Review complete: {currentStatus.replaceAll("_", " ")}.
      </p>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-5">
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
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => review("needs_revision")}
          className="rounded-xl border border-border px-4 py-2.5 text-xs font-extrabold transition-colors hover:bg-background disabled:opacity-60"
        >
          Needs revision
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => review("rejected")}
          className="rounded-xl bg-destructive px-4 py-2.5 text-xs font-extrabold text-destructive-foreground disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {message ? (
        <p className="mt-3 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-sm font-bold text-success-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-bold text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </section>
  );
}
