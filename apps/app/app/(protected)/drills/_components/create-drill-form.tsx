"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createDrill,
  type CreateDrillInput,
} from "../../../actions/workspace";
import type { SportType } from "../../../../lib/database.types";
import {
  DRILL_CATEGORY_OPTIONS,
  DRILL_DIFFICULTY_OPTIONS,
  DRILL_EQUIPMENT_PRESETS,
} from "../../../../lib/coach-vocabulary";

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

type DrillFormState = CreateDrillInput & {
  equipmentPreset: string;
  equipmentCustom: string;
};

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function emptyForm(): DrillFormState {
  return {
    title: "",
    sportType: "football",
    category: "",
    description: "",
    objective: "",
    durationMin: "",
    difficulty: "",
    playerCountMin: "",
    playerCountMax: "",
    areaSetup: "",
    equipment: "",
    equipmentPreset: "",
    equipmentCustom: "",
    instructions: "",
    coachingPoints: "",
    tags: "",
  };
}

export function CreateDrillForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DrillFormState>(() => emptyForm());
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    const equipment =
      form.equipmentPreset === "__custom__"
        ? form.equipmentCustom.trim()
        : form.equipmentPreset;

    const payload: CreateDrillInput = {
      title: form.title,
      sportType: form.sportType,
      category: form.category,
      description: form.description,
      objective: form.objective,
      durationMin: form.durationMin,
      difficulty: form.difficulty,
      playerCountMin: form.playerCountMin,
      playerCountMax: form.playerCountMax,
      areaSetup: form.areaSetup,
      equipment,
      instructions: form.instructions,
      coachingPoints: form.coachingPoints,
      tags: form.tags,
    };

    if (form.equipmentPreset === "__custom__" && !payload.equipment?.trim()) {
      setError("Describe custom equipment or choose a preset.");
      return;
    }

    startTransition(async () => {
      const result = await createDrill(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setForm(emptyForm());
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={() => {
          setForm(emptyForm());
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <Icon icon="solar:add-circle-bold" className="size-4" />
        Add drill
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close create drill modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:notebook-bookmark-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Add drill
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Create a reusable drill for training plans.
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
              <input
                className={`${inputClassName()} md:col-span-2`}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Drill title"
              />
              <select
                className={inputClassName()}
                value={form.sportType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sportType: event.target.value as SportType,
                  }))
                }
              >
                {sportTypes.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                {DRILL_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={form.durationMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMin: event.target.value,
                  }))
                }
                placeholder="Duration minutes"
              />
              <select
                className={inputClassName()}
                value={form.difficulty}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: event.target.value,
                  }))
                }
              >
                {DRILL_DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={form.playerCountMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    playerCountMin: event.target.value,
                  }))
                }
                placeholder="Min players"
              />
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={form.playerCountMax}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    playerCountMax: event.target.value,
                  }))
                }
                placeholder="Max players"
              />
              <select
                className={`${inputClassName()} md:col-span-2`}
                value={form.equipmentPreset}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    equipmentPreset: event.target.value,
                  }))
                }
              >
                {DRILL_EQUIPMENT_PRESETS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {form.equipmentPreset === "__custom__" ? (
                <textarea
                  className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                  value={form.equipmentCustom}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      equipmentCustom: event.target.value,
                    }))
                  }
                  placeholder="Describe equipment (cones, balls, goals, etc.)"
                />
              ) : null}
              <input
                className={`${inputClassName()} md:col-span-2`}
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="Tags, comma separated"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.objective}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    objective: event.target.value,
                  }))
                }
                placeholder="Objective"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.instructions}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    instructions: event.target.value,
                  }))
                }
                placeholder="Instructions"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.coachingPoints}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coachingPoints: event.target.value,
                  }))
                }
                placeholder="Coaching points"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.areaSetup}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    areaSetup: event.target.value,
                  }))
                }
                placeholder="Area setup"
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
                {isPending ? "Saving..." : "Save drill"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
