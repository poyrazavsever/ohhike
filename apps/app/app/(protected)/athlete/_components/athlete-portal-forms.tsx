"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  completeAthletePortalProfile,
  upsertNutritionLog,
  upsertReadinessCheckin,
  type CompleteAthletePortalProfileInput,
  type UpsertNutritionLogInput,
  type UpsertReadinessCheckinInput,
} from "../../../actions/workspace";
import { bodyPainAreaSelectOptions } from "../../../../lib/coach-vocabulary";

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function AthleteOnboardingForm({
  initial,
}: {
  initial: CompleteAthletePortalProfileInput;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await completeAthletePortalProfile(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/athlete/home");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          className={inputClassName()}
          value={form.firstName}
          onChange={(event) =>
            setForm((current) => ({ ...current, firstName: event.target.value }))
          }
          placeholder="First name"
        />
        <input
          className={inputClassName()}
          value={form.lastName}
          onChange={(event) =>
            setForm((current) => ({ ...current, lastName: event.target.value }))
          }
          placeholder="Last name"
        />
        <input
          type="tel"
          className={inputClassName()}
          value={form.phone}
          onChange={(event) =>
            setForm((current) => ({ ...current, phone: event.target.value }))
          }
          placeholder="Phone (optional)"
        />
        <input
          className={inputClassName()}
          value={form.position}
          onChange={(event) =>
            setForm((current) => ({ ...current, position: event.target.value }))
          }
          placeholder="Position / role"
        />
        <input
          className={`${inputClassName()} md:col-span-2`}
          value={form.dominantSide}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              dominantSide: event.target.value,
            }))
          }
          placeholder="Dominant foot / hand"
        />

        {error ? (
          <div className="md:col-span-2 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
            {error}
          </div>
        ) : null}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <Icon icon="solar:check-circle-bold" className="size-4" />
            {isPending ? "Saving…" : "Continue to my dashboard"}
          </button>
        </div>
      </div>
    </>
  );
}

function emptyCheckin(athleteId: string): UpsertReadinessCheckinInput {
  return {
    athleteId,
    checkinDate: today(),
    sleepQuality: "",
    sleepHours: "",
    fatigue: "",
    muscleSoreness: "",
    stress: "",
    mood: "",
    painArea: "",
    notes: "",
  };
}

export function AthleteSelfCheckinForm({ athleteId }: { athleteId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => emptyCheckin(athleteId));

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertReadinessCheckin(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-extrabold text-foreground">Daily check-in</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        Share sleep, fatigue and readiness with your coach.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          type="date"
          className={inputClassName()}
          value={form.checkinDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, checkinDate: event.target.value }))
          }
        />
        <select
          className={inputClassName()}
          value={form.painArea}
          onChange={(event) =>
            setForm((current) => ({ ...current, painArea: event.target.value }))
          }
        >
          {bodyPainAreaSelectOptions(form.painArea).map((opt) => (
            <option key={opt.value || "pain"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(
          [
            ["sleepQuality", "Sleep 1-10"],
            ["fatigue", "Fatigue 1-10"],
            ["muscleSoreness", "Soreness 1-10"],
            ["stress", "Stress 1-10"],
            ["mood", "Mood 1-10"],
            ["sleepHours", "Sleep hours"],
          ] as const
        ).map(([key, label]) => (
          <input
            key={key}
            type="number"
            min={key === "sleepHours" ? "0" : "1"}
            max={key === "sleepHours" ? "24" : "10"}
            className={inputClassName()}
            value={form[key]}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            placeholder={label}
          />
        ))}
        <textarea
          className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Notes for your coach"
        />
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <Icon icon="solar:diskette-bold" className="size-4" />
          {isPending ? "Saving…" : "Save check-in"}
        </button>
      </div>
    </div>
  );
}

function emptyNutrition(athleteId: string): UpsertNutritionLogInput {
  return {
    athleteId,
    logDate: today(),
    hydrationScore: "",
    mealQuality: "",
    proteinServings: "",
    carbsTiming: "",
    supplements: "",
    notes: "",
  };
}

export function AthleteSelfNutritionForm({ athleteId }: { athleteId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => emptyNutrition(athleteId));

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertNutritionLog(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-extrabold text-foreground">Nutrition log</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          type="date"
          className={inputClassName()}
          value={form.logDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, logDate: event.target.value }))
          }
        />
        <input
          type="number"
          min="1"
          max="10"
          className={inputClassName()}
          value={form.hydrationScore}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              hydrationScore: event.target.value,
            }))
          }
          placeholder="Hydration 1-10"
        />
        <input
          type="number"
          min="1"
          max="10"
          className={inputClassName()}
          value={form.mealQuality}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              mealQuality: event.target.value,
            }))
          }
          placeholder="Meal quality 1-10"
        />
        <input
          type="number"
          min="0"
          className={inputClassName()}
          value={form.proteinServings}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              proteinServings: event.target.value,
            }))
          }
          placeholder="Protein servings"
        />
        <input
          className={inputClassName()}
          value={form.carbsTiming}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              carbsTiming: event.target.value,
            }))
          }
          placeholder="Carbs timing"
        />
        <input
          className={inputClassName()}
          value={form.supplements}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              supplements: event.target.value,
            }))
          }
          placeholder="Supplements"
        />
        <textarea
          className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Notes"
        />
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <Icon icon="solar:diskette-bold" className="size-4" />
          {isPending ? "Saving…" : "Save log"}
        </button>
      </div>
    </div>
  );
}
