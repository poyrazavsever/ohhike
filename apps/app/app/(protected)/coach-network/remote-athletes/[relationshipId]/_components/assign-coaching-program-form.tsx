"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  assignCoachingProgram,
  type AssignCoachingProgramInput,
} from "../../../../../actions/coach-network-programs";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function defaultEndDate(start: string) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + 27);
  return date.toISOString().slice(0, 10);
}

export function AssignCoachingProgramForm({
  relationshipId,
}: {
  relationshipId: string;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [startsAt, setStartsAt] = useState(today);
  const [endsAt, setEndsAt] = useState(defaultEndDate(today));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dailyFocus, setDailyFocus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage(null);
    setError(null);

    const input: AssignCoachingProgramInput = {
      relationshipId,
      title,
      description,
      startsAt,
      endsAt,
      dailyFocus,
    };

    startTransition(async () => {
      const result = await assignCoachingProgram(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Program assigned. Previous active programs were replaced.");
      router.refresh();
    });
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Assign coaching program
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Creates a new active program (4-week default window). Athletes mark days complete
        on their home screen; adherence is completed days ÷ elapsed program days.
      </p>

      <div className="mt-4 space-y-3">
        <input
          className={fieldClassName()}
          placeholder="Program title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={`${fieldClassName()} min-h-20`}
          placeholder="Program overview"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className={fieldClassName()}
          placeholder="Today's focus (optional short cue)"
          value={dailyFocus}
          onChange={(e) => setDailyFocus(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Starts
            <input
              type="date"
              className={fieldClassName()}
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                if (e.target.value > endsAt) {
                  setEndsAt(defaultEndDate(e.target.value));
                }
              }}
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Ends
            <input
              type="date"
              className={fieldClassName()}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
        >
          {isPending ? "Assigning…" : "Assign program"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
