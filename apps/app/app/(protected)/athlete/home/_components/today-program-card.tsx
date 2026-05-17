"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { markProgramDayComplete } from "../../../../actions/coach-network-programs";

type TodayProgramCardProps = {
  assignmentId: string;
  title: string;
  focus: string | null;
  completedToday: boolean;
  inWindow: boolean;
  adherencePercent: number | null;
  completedDays: number;
  totalDays: number;
};

export function TodayProgramCard({
  assignmentId,
  title,
  focus,
  completedToday,
  inWindow,
  adherencePercent,
  completedDays,
  totalDays,
}: TodayProgramCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markComplete() {
    setError(null);
    startTransition(async () => {
      const result = await markProgramDayComplete(assignmentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-primary/25 bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">
        Today&apos;s program
      </p>
      <h2 className="mt-1 text-lg font-extrabold text-foreground">{title}</h2>

      {inWindow && focus ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{focus}</p>
      ) : !inWindow ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Your program window is not active today. Check back on your start date.
        </p>
      ) : null}

      {adherencePercent !== null ? (
        <p className="mt-4 text-xs font-semibold text-muted-foreground">
          Adherence: {adherencePercent}% ({completedDays}/{totalDays} days)
        </p>
      ) : null}

      {inWindow ? (
        <div className="mt-4">
          {completedToday ? (
            <p className="text-sm font-bold text-emerald-700">
              Today marked complete ✓
            </p>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={markComplete}
              className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Mark today complete"}
            </button>
          )}
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
