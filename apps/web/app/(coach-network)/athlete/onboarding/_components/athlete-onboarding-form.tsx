"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { SportType } from "../../../../../lib/database.types";
import {
  completeAthleteOnboardingAction,
  type AthleteOnboardingInput,
} from "../actions";

const sportOptions: { value: SportType; label: string }[] = [
  { value: "running", label: "Running" },
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "fitness", label: "Fitness" },
  { value: "tennis", label: "Tennis" },
  { value: "swimming", label: "Swimming" },
  { value: "other", label: "Other" },
];

function fieldClassName() {
  return "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20";
}

function labelClassName() {
  return "text-sm font-bold text-foreground";
}

export function AthleteOnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);

  function toggleSport(sport: SportType) {
    setSelectedSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload: AthleteOnboardingInput = {
      displayName: String(formData.get("displayName") ?? ""),
      goals: String(formData.get("goals") ?? ""),
      sportInterests: selectedSports,
      timezone: String(formData.get("timezone") ?? "") || undefined,
    };

    startTransition(async () => {
      try {
        await completeAthleteOnboardingAction(payload);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not save your profile.",
        );
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          Athlete onboarding
        </p>
        <h1 className="text-3xl font-extrabold text-foreground">
          Athlete profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell coaches about your goals so they can respond to your
          applications.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="displayName" className={labelClassName()}>
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          className={fieldClassName()}
          placeholder="How coaches should see you"
        />
      </div>

      <div className="space-y-2">
        <span className={labelClassName()}>Sports you care about</span>
        <div className="flex flex-wrap gap-2">
          {sportOptions.map((sport) => {
            const active = selectedSports.includes(sport.value);

            return (
              <button
                key={sport.value}
                type="button"
                onClick={() => toggleSport(sport.value)}
                className={
                  active
                    ? "rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                    : "rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                }
              >
                {sport.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="goals" className={labelClassName()}>
          Goals
        </label>
        <textarea
          id="goals"
          name="goals"
          required
          rows={4}
          className={`${fieldClassName()} min-h-28 py-3`}
          placeholder="What do you want to achieve with remote coaching?"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="timezone" className={labelClassName()}>
          Timezone (optional)
        </label>
        <input
          id="timezone"
          name="timezone"
          className={fieldClassName()}
          placeholder="Europe/Istanbul"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-foreground">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Continue to find a coach"}
      </Button>
    </form>
  );
}
