"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createAdditionalOrganization,
  type CreateOrganizationInput,
} from "../../../../../actions/workspace";
import type {
  OrganizationType,
  SportType,
} from "../../../../../../lib/db.types";

const organizationTypes: Array<{ label: string; value: OrganizationType }> = [
  { label: "Club", value: "club" },
  { label: "Academy", value: "academy" },
  { label: "Individual coach", value: "individual_coach" },
  { label: "School team", value: "school_team" },
  { label: "University team", value: "university_team" },
  { label: "Performance center", value: "performance_center" },
  { label: "Other", value: "other" },
];

const sportTypes: Array<{ label: string; value: SportType }> = [
  { label: "Football", value: "football" },
  { label: "Basketball", value: "basketball" },
  { label: "Volleyball", value: "volleyball" },
  { label: "Handball", value: "handball" },
  { label: "Running", value: "running" },
  { label: "Fitness", value: "fitness" },
  { label: "Tennis", value: "tennis" },
  { label: "Swimming", value: "swimming" },
  { label: "Martial arts", value: "martial_arts" },
  { label: "Esports", value: "esports" },
  { label: "Other", value: "other" },
];

function inputClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
}

export function NewOrganizationForm({ canCreate }: { canCreate: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateOrganizationInput>({
    organization: {
      name: "",
      type: "club",
      city: "",
      country: "",
    },
    team: {
      name: "",
      sportType: "football",
      ageGroup: "",
      level: "",
      weeklyTrainingCount: "",
    },
  });

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createAdditionalOrganization(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  if (!canCreate) {
    return (
      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="text-base font-extrabold text-foreground">
          Multiple organizations are a Pro feature.
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Basic teams include one organization and up to three team members.
          Upgrade to Pro or Pro Plus to manage multiple organizations.
        </p>
        <button
          type="button"
          onClick={() => router.push("/settings/billing")}
          className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          View plans
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Organization name
          </label>
          <input
            className={inputClassName()}
            value={form.organization.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                organization: {
                  ...current.organization,
                  name: event.target.value,
                },
              }))
            }
            placeholder="Second academy organization"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Organization type
          </label>
          <select
            className={inputClassName()}
            value={form.organization.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                organization: {
                  ...current.organization,
                  type: event.target.value as OrganizationType,
                },
              }))
            }
          >
            {organizationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            City
          </label>
          <input
            className={inputClassName()}
            value={form.organization.city}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                organization: {
                  ...current.organization,
                  city: event.target.value,
                },
              }))
            }
            placeholder="City"
          />
        </div>

        <div className="md:col-span-2 mt-2 h-px bg-border" />

        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            First team name
          </label>
          <input
            className={inputClassName()}
            value={form.team.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                team: {
                  ...current.team,
                  name: event.target.value,
                },
              }))
            }
            placeholder="U19 Football Team"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sport type
          </label>
          <select
            className={inputClassName()}
            value={form.team.sportType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                team: {
                  ...current.team,
                  sportType: event.target.value as SportType,
                },
              }))
            }
          >
            {sportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Weekly training count
          </label>
          <input
            type="number"
            min="0"
            step="1"
            className={inputClassName()}
            value={form.team.weeklyTrainingCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                team: {
                  ...current.team,
                  weeklyTrainingCount: event.target.value,
                },
              }))
            }
            placeholder="4"
          />
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create organization"}
        </button>
      </div>
    </div>
  );
}

