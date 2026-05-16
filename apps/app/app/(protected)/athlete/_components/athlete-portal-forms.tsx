"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  completeAthletePortalProfile,
  createPersonalTraining,
  upsertNutritionLog,
  upsertReadinessCheckin,
  type CompleteAthletePortalProfileInput,
  type CreatePersonalTrainingInput,
  type UpsertNutritionLogInput,
  type UpsertReadinessCheckinInput,
} from "../../../actions/workspace";
import {
  bodyPainAreaSelectOptions,
  personalTrainingTypeSelectOptions,
} from "../../../../lib/coach-vocabulary";
import { AthletePortalFormModal } from "./athlete-portal-modal";

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toDatetimeLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function AthleteFormTrigger({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <Icon icon={icon} className="size-4" />
        {label}
      </button>
    </div>
  );
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
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => emptyCheckin(athleteId));

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function openModal() {
    setForm(emptyCheckin(athleteId));
    setError(null);
    setIsOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertReadinessCheckin(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(emptyCheckin(athleteId));
      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <AthleteFormTrigger
        label="Add check-in"
        icon="solar:pulse-2-bold"
        onClick={openModal}
      />

      <AthletePortalFormModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Daily check-in"
        description="Share sleep, fatigue and readiness with your coach."
        icon="solar:pulse-2-bold"
        closeAriaLabel="Close check-in modal"
        error={error}
        isPending={isPending}
        submitLabel="Save check-in"
        onSubmit={submit}
      >
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            type="date"
            className={inputClassName()}
            value={form.checkinDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                checkinDate: event.target.value,
              }))
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
      </AthletePortalFormModal>
    </>
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
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => emptyNutrition(athleteId));

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function openModal() {
    setForm(emptyNutrition(athleteId));
    setError(null);
    setIsOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertNutritionLog(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(emptyNutrition(athleteId));
      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <AthleteFormTrigger
        label="Add nutrition log"
        icon="solar:cup-hot-bold"
        onClick={openModal}
      />

      <AthletePortalFormModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Nutrition log"
        description="Track hydration, meals and supplements for your coaching staff."
        icon="solar:cup-hot-bold"
        closeAriaLabel="Close nutrition log modal"
        error={error}
        isPending={isPending}
        submitLabel="Save log"
        onSubmit={submit}
      >
        <div className="mt-5 grid gap-3 md:grid-cols-2">
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
      </AthletePortalFormModal>
    </>
  );
}

function emptyPersonalTraining(athleteId: string): CreatePersonalTrainingInput {
  return {
    athleteId,
    title: "",
    trainingType: "",
    startedAt: toDatetimeLocal(),
    durationMin: "",
    distanceKm: "",
    rpe: "",
    notes: "",
  };
}

export function AthleteSelfPersonalTrainingForm({
  athleteId,
}: {
  athleteId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => emptyPersonalTraining(athleteId));

  const typeOptions = personalTrainingTypeSelectOptions(form.trainingType);

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function openModal() {
    setForm(emptyPersonalTraining(athleteId));
    setError(null);
    setIsOpen(true);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createPersonalTraining(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setForm(emptyPersonalTraining(athleteId));
      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <AthleteFormTrigger
        label="Log personal training"
        icon="solar:running-bold"
        onClick={openModal}
      />

      <AthletePortalFormModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Log personal training"
        description="Record extra work outside scheduled team sessions."
        icon="solar:running-bold"
        closeAriaLabel="Close personal training modal"
        maxWidthClassName="max-w-2xl"
        error={error}
        isPending={isPending}
        submitLabel="Save training"
        onSubmit={submit}
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className={inputClassName()}
            value={form.trainingType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                trainingType: event.target.value,
              }))
            }
          >
            {typeOptions.map((option) => (
              <option key={option.value || "type"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className={inputClassName()}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Title"
          />
          <input
            type="datetime-local"
            className={inputClassName()}
            value={form.startedAt}
            onChange={(event) =>
              setForm((current) => ({ ...current, startedAt: event.target.value }))
            }
          />
          <input
            type="number"
            min="1"
            className={inputClassName()}
            value={form.durationMin}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                durationMin: event.target.value,
              }))
            }
            placeholder="Minutes"
          />
          <input
            type="number"
            min="1"
            max="10"
            className={inputClassName()}
            value={form.rpe}
            onChange={(event) =>
              setForm((current) => ({ ...current, rpe: event.target.value }))
            }
            placeholder="RPE 1-10"
          />
          <textarea
            className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            placeholder="Notes for your coach"
          />
        </div>
      </AthletePortalFormModal>
    </>
  );
}
