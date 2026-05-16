"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createWearableConnection,
  type CreateWearableConnectionInput,
} from "../../../actions/workspace";
import type { WearableProvider } from "../../../../lib/database.types";

type AthleteOption = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

const providers: Array<{ label: string; value: WearableProvider }> = [
  { label: "Strava", value: "strava" },
  { label: "Garmin", value: "garmin" },
  { label: "Apple Health", value: "apple_health" },
  { label: "Health Connect", value: "health_connect" },
  { label: "Polar", value: "polar" },
  { label: "Fitbit", value: "fitbit" },
  { label: "Manual", value: "manual" },
  { label: "CSV Import", value: "csv_import" },
  { label: "Other", value: "other" },
];

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function athleteName(athlete: AthleteOption) {
  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function emptyForm(athleteId: string): CreateWearableConnectionInput {
  return {
    athleteId,
    provider: "manual",
    providerUserId: "",
    scopes: "",
  };
}

export function CreateWearableConnectionForm({
  athletes,
}: {
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateWearableConnectionInput>(
    emptyForm(athletes[0]?.id ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createWearableConnection(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setForm(emptyForm(athletes[0]?.id ?? ""));
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        disabled={athletes.length === 0}
        onClick={() => {
          setForm(emptyForm(athletes[0]?.id ?? ""));
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:watch-round-bold" className="size-4" />
        Add connection
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close wearable connection modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:watch-round-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Add wearable connection
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Register a provider connection before OAuth/token sync is enabled.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Icon icon="solar:close-circle-bold" className="size-3.5" />
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select
                className={inputClassName()}
                value={form.athleteId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    athleteId: event.target.value,
                  }))
                }
              >
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athleteName(athlete)}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.provider}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    provider: event.target.value as WearableProvider,
                  }))
                }
              >
                {providers.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <input
                className={inputClassName()}
                value={form.providerUserId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    providerUserId: event.target.value,
                  }))
                }
                placeholder="Provider user id"
              />
              <input
                className={inputClassName()}
                value={form.scopes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scopes: event.target.value,
                  }))
                }
                placeholder="Scopes, comma separated"
              />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save connection"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
