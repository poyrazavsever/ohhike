"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setPrivateAthleteRating } from "../../../../../actions/coach-network-reviews";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function PrivateAthleteRatingForm({
  relationshipId,
  initialRating,
  initialNote,
}: {
  relationshipId: string;
  initialRating?: number;
  initialNote?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 4);
  const [note, setNote] = useState(initialNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await setPrivateAthleteRating({
        relationshipId,
        rating,
        note,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Private rating saved (visible only to your staff).");
      router.refresh();
    });
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Private athlete rating
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Internal note for your team — not shown on the public marketplace profile.
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
              {value} / 5
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Note
        <textarea
          className={`${fieldClassName()} min-h-20`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Coaching fit, communication, reliability…"
        />
      </label>

      <button
        type="button"
        disabled={isPending}
        onClick={save}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save private rating"}
      </button>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
