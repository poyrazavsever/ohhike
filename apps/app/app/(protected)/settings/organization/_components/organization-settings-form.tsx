"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  updateActiveOrganization,
  type UpdateOrganizationInput,
} from "../../../../actions/workspace";
import type { OrganizationType } from "../../../../../lib/db.types";

const organizationTypes: Array<{ label: string; value: OrganizationType }> = [
  { label: "Club", value: "club" },
  { label: "Academy", value: "academy" },
  { label: "Individual coach", value: "individual_coach" },
  { label: "School team", value: "school_team" },
  { label: "University team", value: "university_team" },
  { label: "Performance center", value: "performance_center" },
  { label: "Other", value: "other" },
];

function inputClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
}

export function OrganizationSettingsForm({
  initialValues,
  canUpdate,
}: {
  initialValues: UpdateOrganizationInput;
  canUpdate: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateActiveOrganization(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Organization settings updated.");
      router.refresh();
    });
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
            disabled={!canUpdate}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Organization name"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Organization type
          </label>
          <select
            className={inputClassName()}
            disabled={!canUpdate}
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as OrganizationType,
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
            disabled={!canUpdate}
            value={form.city ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, city: event.target.value }))
            }
            placeholder="City"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Country
          </label>
          <input
            className={inputClassName()}
            disabled={!canUpdate}
            value={form.country ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, country: event.target.value }))
            }
            placeholder="Country"
          />
        </div>
      </div>

      {!canUpdate ? (
        <div className="mt-5 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm font-bold text-warning-foreground">
          Only organization owners and admins can edit these settings.
        </div>
      ) : null}

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

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!canUpdate || isPending}
          onClick={submit}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

