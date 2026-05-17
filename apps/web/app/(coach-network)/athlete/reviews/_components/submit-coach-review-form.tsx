"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitCoachReview } from "../../../../actions/coach-network-reviews";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function SubmitCoachReviewForm({
  relationshipId,
  coachName,
  redirectOnSuccess = "/athlete/reviews?submitted=1",
}: {
  relationshipId: string;
  coachName: string;
  redirectOnSuccess?: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await submitCoachReview({
        relationshipId,
        rating,
        title,
        body,
        isPublic,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Thank you! Your review was submitted.");
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold text-foreground">
        Review {coachName}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Public reviews appear on the coach&apos;s marketplace profile.
      </p>

      <fieldset className="mt-4">
        <legend className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Rating
        </legend>
        <div className="mt-2 flex items-center gap-1" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className={`text-3xl leading-none transition-colors ${
                value <= rating
                  ? "text-primary"
                  : "text-muted-foreground/30 hover:text-primary/60"
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-muted-foreground">
            {rating}/5
          </span>
        </div>
      </fieldset>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Title
        <input
          className={fieldClassName()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Review
        <textarea
          className={`${fieldClassName()} min-h-28`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What went well? What could improve?"
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Show on public coach profile
      </label>

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit review"}
      </button>

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
    </div>
  );
}
