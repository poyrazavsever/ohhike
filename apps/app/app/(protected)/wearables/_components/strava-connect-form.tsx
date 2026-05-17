"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

type AthleteOption = {
  id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

function athleteLabel(athlete: AthleteOption) {
  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export function StravaConnectForm({
  athletes,
}: {
  athletes: AthleteOption[];
}) {
  const [athleteId, setAthleteId] = useState(athletes[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={athleteId}
        onChange={(event) => setAthleteId(event.target.value)}
        className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {athletes.map((athlete) => (
          <option key={athlete.id} value={athlete.id}>
            {athleteLabel(athlete)}
          </option>
        ))}
      </select>
      <a
        href={athleteId ? `/api/wearables/strava/connect?athleteId=${athleteId}` : "#"}
        aria-disabled={!athleteId}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition-colors hover:bg-primary-hover aria-disabled:pointer-events-none aria-disabled:opacity-60"
      >
        <Icon icon="solar:link-bold" className="size-4" />
        Connect Strava
      </a>
    </div>
  );
}
