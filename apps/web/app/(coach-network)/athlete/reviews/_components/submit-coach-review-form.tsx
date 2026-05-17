"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitCoachReview } from "../../../../actions/coach-network-reviews";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function SubmitCoachReviewForm({
  relationshipId,
  coachName,
}: {
  relationshipId: string;
  coachName: string;
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
      router.push("/athlete/reviews?submitted=1");
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold text-foreground">Review {coachName}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Public reviews appear on the coach&apos;s marketplace profile.
      </p>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Rating
        <select
          className={fieldClassName()}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </label>

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
        className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </button>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
