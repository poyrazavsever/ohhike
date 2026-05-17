"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { confirmRemoteCoachingPayment } from "../../../../actions/coach-network-offers";

type RemoteAthleteRow = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string | null;
  athlete: {
    id: string;
    display_name: string | null;
    first_name: string;
    last_name: string | null;
    email: string | null;
  } | null;
  activeAssignment: { title: string } | null;
  adherence: {
    percent: number | null;
    completedDays: number;
    totalDays: number;
  } | null;
};

function athleteLabel(athlete: RemoteAthleteRow["athlete"]) {
  if (!athlete) {
    return "Athlete";
  }
  return (
    athlete.display_name ??
    [athlete.first_name, athlete.last_name].filter(Boolean).join(" ") ??
    athlete.email ??
    "Athlete"
  );
}

export function RemoteAthletesList({ rows }: { rows: RemoteAthleteRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm(relationshipId: string) {
    setError(null);
    startTransition(async () => {
      const result = await confirmRemoteCoachingPayment(relationshipId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
        No remote athletes yet. When an athlete accepts your offer, they appear here
        for payment confirmation and roster provisioning.
      </div>
    );
  }

  return (
    <>
      <ul className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/coach-network/remote-athletes/${row.id}`}
                className="font-extrabold text-foreground hover:text-primary"
              >
                {athleteLabel(row.athlete)}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.status.replaceAll("_", " ")} · payment:{" "}
                {row.payment_status.replaceAll("_", " ")}
              </p>
              {row.activeAssignment ? (
                <p className="mt-1 text-xs font-semibold text-foreground">
                  Program: {row.activeAssignment.title}
                  {row.adherence?.percent != null
                    ? ` · ${row.adherence.percent}% adherence`
                    : ""}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">No program assigned</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/coach-network/remote-athletes/${row.id}`}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted/50"
              >
                Manage
              </Link>
              {row.payment_status === "pending_manual" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => confirm(row.id)}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                >
                  Confirm payment
                </button>
              ) : (
                <span className="text-xs font-bold uppercase text-emerald-700">
                  Payment confirmed
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </>
  );
}
