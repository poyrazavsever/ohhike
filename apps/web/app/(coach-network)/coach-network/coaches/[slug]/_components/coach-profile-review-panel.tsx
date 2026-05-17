import Link from "next/link";

import type { CoachProfileReviewState } from "../../../../../../app/actions/coach-network-reviews";
import { SubmitCoachReviewForm } from "../../../../athlete/reviews/_components/submit-coach-review-form";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-primary" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function CoachProfileReviewPanel({
  state,
  coachName,
  profileHref,
}: {
  state: CoachProfileReviewState;
  coachName: string;
  profileHref: string;
}) {
  if (state.status === "not_eligible") {
    return null;
  }

  if (state.status === "anonymous") {
    return (
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-bold text-foreground">
          Worked with this coach through OhHike?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to leave a verified review after coaching begins.
        </p>
        <Link
          href={`/login?redirect_url=${encodeURIComponent(profileHref)}`}
          className="mt-4 inline-flex rounded-xl border border-border px-4 py-2.5 text-sm font-extrabold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Sign in to review
        </Link>
      </div>
    );
  }

  if (state.status === "already_reviewed") {
    return (
      <div className="mt-4 rounded-2xl border border-success/25 bg-success-soft p-5">
        <p className="text-sm font-extrabold text-success-foreground">
          You reviewed {coachName}
        </p>
        <div className="mt-2">
          <Stars rating={state.review.rating} />
        </div>
        {state.review.title ? (
          <p className="mt-2 text-sm font-bold text-success-foreground">
            {state.review.title}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-success-foreground/80">
          Thanks for sharing feedback from your coaching experience.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <SubmitCoachReviewForm
        relationshipId={state.relationshipId}
        coachName={coachName}
        redirectOnSuccess={null}
      />
    </div>
  );
}
