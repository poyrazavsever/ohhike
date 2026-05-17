"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  upsertCoachMarketplaceProfile,
  type CoachMarketplaceProfileInput,
} from "../../../../actions/coach-network";
import { slugifyCoachProfile } from "../../../../../lib/coach-network/slug";
import type { SportType, Tables } from "../../../../../lib/database.types";

const sportOptions: SportType[] = [
  "running",
  "football",
  "basketball",
  "fitness",
  "tennis",
  "swimming",
  "other",
];

const modeOptions = ["remote", "hybrid", "in_person"];

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function labelClassName() {
  return "text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground";
}

function toFormState(
  profile: Tables<"coach_marketplace_profiles"> | null,
  organizationName: string,
): CoachMarketplaceProfileInput {
  return {
    displayName: profile?.display_name ?? organizationName,
    slug: profile?.slug ?? slugifyCoachProfile(organizationName),
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    photoUrl: profile?.photo_url ?? "",
    specialties: profile?.specialties ?? [],
    sports: profile?.sports ?? ["running"],
    coachingModes: profile?.coaching_modes ?? ["remote"],
    languages: profile?.languages ?? ["English"],
    locationCountry: profile?.location_country ?? "",
    locationCity: profile?.location_city ?? "",
    yearsExperience: profile?.years_experience,
    pricingDisplay: profile?.pricing_display ?? "",
    capacity: profile?.capacity,
    responseTimeAvgHours: profile?.response_time_avg_hours,
    isPublic: profile?.is_public ?? false,
    isAcceptingClients: profile?.is_accepting_clients ?? true,
  };
}

export function CoachMarketplaceProfileForm({
  initialProfile,
  organizationName,
  publicProfileUrl,
  canPublish,
}: {
  initialProfile: Tables<"coach_marketplace_profiles"> | null;
  organizationName: string;
  publicProfileUrl: string | null;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    toFormState(initialProfile, organizationName),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const slugPreview = useMemo(
    () => slugifyCoachProfile(form.slug || form.displayName),
    [form.slug, form.displayName],
  );

  function toggleSport(sport: SportType) {
    setForm((current) => {
      const sports = current.sports ?? [];
      return {
        ...current,
        sports: sports.includes(sport)
          ? sports.filter((item) => item !== sport)
          : [...sports, sport],
      };
    });
  }

  function toggleMode(mode: string) {
    setForm((current) => {
      const modes = current.coachingModes ?? [];
      return {
        ...current,
        coachingModes: modes.includes(mode)
          ? modes.filter((item) => item !== mode)
          : [...modes, mode],
      };
    });
  }

  function submit() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await upsertCoachMarketplaceProfile({
        ...form,
        slug: slugPreview,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        result.profile.is_public
          ? "Profile saved and published on Find a coach."
          : "Profile saved as draft.",
      );
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
      {!canPublish ? (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Pro plan required to publish your marketplace profile.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClassName()}>Display name</label>
          <input
            className={fieldClassName()}
            value={form.displayName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className={labelClassName()}>Profile URL slug</label>
          <input
            className={fieldClassName()}
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Public URL: /coach-network/coaches/{slugPreview}
          </p>
        </div>

        <div>
          <label className={labelClassName()}>Headline</label>
          <input
            className={fieldClassName()}
            value={form.headline ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, headline: event.target.value }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClassName()}>Bio</label>
          <textarea
            className={`${fieldClassName()} min-h-28`}
            value={form.bio ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, bio: event.target.value }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <span className={labelClassName()}>Sports</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {sportOptions.map((sport) => {
              const active = (form.sports ?? []).includes(sport);
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={
                    active
                      ? "rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                      : "rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <span className={labelClassName()}>Coaching modes</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {modeOptions.map((mode) => {
              const active = (form.coachingModes ?? []).includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleMode(mode)}
                  className={
                    active
                      ? "rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                      : "rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClassName()}>Pricing display</label>
          <input
            className={fieldClassName()}
            value={form.pricingDisplay ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                pricingDisplay: event.target.value,
              }))
            }
            placeholder="From $120 / month"
          />
        </div>

        <div>
          <label className={labelClassName()}>City</label>
          <input
            className={fieldClassName()}
            value={form.locationCity ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                locationCity: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isPublic}
            disabled={!canPublish}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isPublic: event.target.checked,
              }))
            }
          />
          Publish on Find a coach
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isAcceptingClients}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isAcceptingClients: event.target.checked,
              }))
            }
          />
          Accepting new clients
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save profile"}
        </button>
        {publicProfileUrl && initialProfile?.is_public ? (
          <a
            href={publicProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View public profile
          </a>
        ) : null}
      </div>

      {message ? (
        <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
