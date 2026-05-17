"use client";

import { useState, useTransition } from "react";

import type { PublicCoachReview } from "../../../../../../lib/coach-network/types";
import { reportCoachReview } from "../../../../../../app/actions/coach-network-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-primary" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function CoachPublicReviews({ reviews }: { reviews: PublicCoachReview[] }) {
  if (reviews.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No public reviews yet. Be the first after coaching with this coach.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </ul>
  );
}

function ReviewCard({ review }: { review: PublicCoachReview }) {
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [isPending, startTransition] = useTransition();

  function report() {
    setError(null);
    startTransition(async () => {
      const result = await reportCoachReview({ reviewId: review.id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReported(true);
    });
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Stars rating={review.rating} />
          {review.title ? (
            <p className="mt-2 font-extrabold text-foreground">{review.title}</p>
          ) : null}
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {review.athleteDisplayName}
            {review.createdAt
              ? ` · ${new Date(review.createdAt).toLocaleDateString()}`
              : ""}
          </p>
        </div>
        {!reported ? (
          <button
            type="button"
            disabled={isPending}
            onClick={report}
            className="text-xs font-bold text-muted-foreground hover:text-destructive"
          >
            Report
          </button>
        ) : (
          <span className="text-xs font-bold text-muted-foreground">Reported</span>
        )}
      </div>
      {review.body ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.body}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </li>
  );
}
