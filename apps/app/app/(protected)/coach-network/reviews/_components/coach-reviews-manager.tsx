"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  moderateCoachReview,
  reportCoachReviewFromCoach,
} from "../../../../actions/coach-network-reviews";

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_public: boolean;
  athlete_user_id: string;
  created_at: string | null;
  metadataParsed: {
    reported?: boolean;
    report_reason?: string;
  };
};

export function CoachReviewsManager({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm font-black text-foreground">
          No athlete reviews yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
          Public reviews will appear here after completed remote coaching
          relationships.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {reviews.map((review) => (
        <ReviewRowActions key={review.id} review={review} />
      ))}
    </ul>
  );
}

function ReviewRowActions({ review }: { review: ReviewRow }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function moderate(isPublic: boolean, clearReport?: boolean) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await moderateCoachReview({
        reviewId: review.id,
        isPublic,
        clearReport,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        isPublic ? "Review published." : "Review hidden from public profile.",
      );
      router.refresh();
    });
  }

  function report() {
    setError(null);
    startTransition(async () => {
      const result = await reportCoachReviewFromCoach({
        reviewId: review.id,
        reason: "Flagged by coach",
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-foreground">
            {review.title ?? "Review"} · {review.rating}/5
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {review.is_public ? "Public" : "Hidden"}
            {review.metadataParsed.reported ? " · Reported" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => moderate(true, true)}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => moderate(false)}
            className="rounded-xl border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-background"
          >
            Hide
          </button>
          {!review.metadataParsed.reported ? (
            <button
              type="button"
              disabled={isPending}
              onClick={report}
              className="rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive"
            >
              Flag
            </button>
          ) : null}
        </div>
      </div>
      {review.body ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {review.body}
        </p>
      ) : null}
      {review.metadataParsed.report_reason ? (
        <p className="mt-2 text-xs font-semibold text-warning-foreground">
          Report reason: {review.metadataParsed.report_reason}
        </p>
      ) : null}
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
    </li>
  );
}
