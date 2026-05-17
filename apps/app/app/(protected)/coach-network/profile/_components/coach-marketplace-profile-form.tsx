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
const completionFields = [
  "displayName",
  "headline",
  "bio",
  "introVideoUrl",
  "trainingPhilosophy",
  "featuredResult",
  "sports",
  "specialties",
  "languages",
  "locationCity",
  "locationCountry",
  "yearsExperience",
  "pricingDisplay",
] as const;

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
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
    introVideoUrl: profile?.intro_video_url ?? "",
    trainingPhilosophy: profile?.training_philosophy ?? "",
    featuredResult: profile?.featured_result ?? "",
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
  const completedFields = completionFields.filter((field) => {
    const value = form[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
  const completionPercent = Math.round(
    (completedFields / completionFields.length) * 100,
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
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      {!canPublish ? (
        <p className="mb-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-bold text-warning-foreground">
          Pro plan required to publish your marketplace profile.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
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
                setForm((current) => ({
                  ...current,
                  headline: event.target.value,
                }))
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
            <label className={labelClassName()}>Intro video URL</label>
            <input
              className={fieldClassName()}
              value={form.introVideoUrl ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  introVideoUrl: event.target.value,
                }))
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClassName()}>Training philosophy</label>
            <textarea
              className={`${fieldClassName()} min-h-24`}
              value={form.trainingPhilosophy ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trainingPhilosophy: event.target.value,
                }))
              }
              placeholder="How you coach, how you communicate, and what athletes can expect."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClassName()}>Featured result</label>
            <input
              className={fieldClassName()}
              value={form.featuredResult ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  featuredResult: event.target.value,
                }))
              }
              placeholder="Helped 12 athletes complete their first marathon in 2025"
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
            <label className={labelClassName()}>Specialties</label>
            <input
              className={fieldClassName()}
              value={(form.specialties ?? []).join(", ")}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specialties: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="Endurance, return to sport"
            />
          </div>

          <div>
            <label className={labelClassName()}>Languages</label>
            <input
              className={fieldClassName()}
              value={(form.languages ?? []).join(", ")}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  languages: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="English, Turkish"
            />
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

          <div>
            <label className={labelClassName()}>Country</label>
            <input
              className={fieldClassName()}
              value={form.locationCountry ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  locationCountry: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className={labelClassName()}>Years experience</label>
            <input
              type="number"
              min={0}
              className={fieldClassName()}
              value={form.yearsExperience ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  yearsExperience: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </div>

          <div>
            <label className={labelClassName()}>Typical response hours</label>
            <input
              type="number"
              min={0}
              step="0.5"
              className={fieldClassName()}
              value={form.responseTimeAvgHours ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  responseTimeAvgHours: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black text-foreground">
                  Profile completeness
                </p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  Richer profiles are easier to trust before an application.
                </p>
              </div>
              <span className="text-2xl font-black text-primary">
                {completionPercent}%
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-card">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-black text-foreground">Publication</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
              Control how your profile appears in the public marketplace and
              whether athletes can send new applications.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm font-semibold text-foreground">
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
                  className="mt-0.5"
                />
                <span>
                  Publish on Find a coach
                  <span className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground">
                    Makes the profile discoverable on the public directory.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={form.isAcceptingClients}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isAcceptingClients: event.target.checked,
                    }))
                  }
                  className="mt-0.5"
                />
                <span>
                  Accepting new clients
                  <span className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground">
                    Controls whether athletes can submit applications.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-4 rounded-xl bg-card p-3">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Public route
              </p>
              <p className="mt-1 break-all text-sm font-black text-foreground">
                /coach-network/coaches/{slugPreview}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 rounded-2xl border border-success/30 bg-success-soft p-4 text-sm font-bold text-success-foreground">
          {message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {publicProfileUrl && initialProfile?.is_public ? (
          <a
            href={publicProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-primary-700 transition-colors hover:text-primary-hover"
          >
            View public profile
          </a>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">
            Save a public profile to generate a shareable link.
          </p>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}
