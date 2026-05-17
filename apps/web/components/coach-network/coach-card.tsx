import { Icon } from "@iconify/react";
import Link from "next/link";

import type { PublicCoachCard } from "../../lib/coach-network/types";

function formatRating(rating: number | null, reviewCount: number) {
  if (rating === null || reviewCount === 0) {
    return "New coach";
  }

  return `${rating.toFixed(1)} (${reviewCount})`;
}

function formatLocation(city: string | null, country: string | null) {
  return [city, country].filter(Boolean).join(", ") || "Remote";
}

export function CoachCard({ coach }: { coach: PublicCoachCard }) {
  const profileHref = `/coach-network/coaches/${coach.slug}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/35">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          {coach.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.photoUrl}
              alt=""
              className="size-14 rounded-2xl object-cover"
            />
          ) : (
            <Icon icon="solar:user-bold" className="size-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-extrabold text-foreground">
            {coach.displayName}
          </h2>
          {coach.headline ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {coach.headline}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon icon="solar:star-bold" className="size-4 text-primary" />
          <span>{formatRating(coach.averageRating, coach.reviewCount)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="solar:map-point-bold" className="size-4" />
          <span>
            {formatLocation(coach.locationCity, coach.locationCountry)}
          </span>
        </div>
        {coach.pricingDisplay ? (
          <div className="flex items-center gap-2">
            <Icon icon="solar:wallet-bold" className="size-4" />
            <span>{coach.pricingDisplay}</span>
          </div>
        ) : null}
      </dl>

      {coach.sports.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {coach.sports.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              {sport.replace("_", " ")}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link
          href={profileHref}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-xs font-extrabold text-primary-foreground hover:bg-primary-hover"
        >
          View profile
        </Link>
        <Link
          href={`/coach-network/apply/${coach.id}`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border px-4 text-xs font-extrabold text-foreground hover:border-primary/40 hover:bg-primary-soft"
        >
          Apply
        </Link>
      </div>

      {!coach.isAcceptingClients ? (
        <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
          Not accepting new clients right now
        </p>
      ) : null}
    </article>
  );
}
