import { Suspense } from "react";

import { CoachCard } from "../../../components/coach-network/coach-card";
import type { SportType } from "../../../lib/database.types";
import { listPublicCoaches } from "../../../lib/coach-network/public-queries";
import type { PublicCoachSort } from "../../../lib/coach-network/types";
import { FindCoachFilters } from "./_components/find-coach-filters";

type FindCoachPageProps = {
  searchParams: Promise<{
    q?: string;
    sport?: string;
    remote?: string;
    sort?: string;
  }>;
};

function parseSport(value: string | undefined): SportType | undefined {
  const sports: SportType[] = [
    "football",
    "basketball",
    "volleyball",
    "handball",
    "running",
    "fitness",
    "tennis",
    "swimming",
    "martial_arts",
    "esports",
    "other",
  ];

  if (value && sports.includes(value as SportType)) {
    return value as SportType;
  }

  return undefined;
}

function parseSort(value: string | undefined): PublicCoachSort {
  if (value === "newest" || value === "name" || value === "rating") {
    return value;
  }

  return "rating";
}

export default async function FindCoachPage({ searchParams }: FindCoachPageProps) {
  const params = await searchParams;
  const coaches = await listPublicCoaches({
    q: params.q,
    sport: parseSport(params.sport),
    remoteOnly: params.remote === "1",
    sort: parseSort(params.sort),
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-foreground">Find a coach</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Browse remote coaching profiles, compare packages, and apply when you are
          ready.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 rounded-3xl bg-muted" />}>
          <FindCoachFilters />
        </Suspense>
      </div>

      {coaches.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No public coaches match your filters yet. Run{" "}
            <code className="rounded bg-muted px-1">
              docs/supabase/dev_seed_coach_network_profiles.sql
            </code>{" "}
            in Supabase or publish your marketplace profile from CoachOS.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}
    </main>
  );
}
