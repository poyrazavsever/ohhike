"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { confirmRemoteCoachingPayment } from "../../../../actions/coach-network-offers";
import { EmptyStateCard } from "../../../../../components/dashboard/dashboard-cards";

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
      <EmptyStateCard
        title="No remote athletes yet"
        description="When an athlete accepts your offer, they appear here for payment confirmation and roster provisioning."
        icon="solar:users-group-rounded-bold"
      />
    );
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1.3fr_1fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
          <span>Athlete</span>
          <span>Status</span>
          <span>Program</span>
          <span>Actions</span>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid gap-3 px-4 py-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/coach-network/remote-athletes/${row.id}`}
                  className="text-sm font-black text-foreground transition-colors hover:text-primary"
                >
                  {athleteLabel(row.athlete)}
                </Link>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                  {row.status.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Payment: {row.payment_status.replaceAll("_", " ")}
                </p>
              </div>
              <div>
                {row.activeAssignment ? (
                  <p className="text-xs font-semibold text-foreground">
                    {row.activeAssignment.title}
                    {row.adherence?.percent != null
                      ? ` · ${row.adherence.percent}% adherence`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground">
                    No program assigned
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/coach-network/remote-athletes/${row.id}`}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-background"
                >
                  Manage
                </Link>
                {row.payment_status === "pending_manual" ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => confirm(row.id)}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    Confirm payment
                  </button>
                ) : (
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-success-foreground">
                    Payment confirmed
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {error ? (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-bold text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </>
  );
}
