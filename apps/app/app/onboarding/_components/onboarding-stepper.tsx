// @ts-nocheck
"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { OrganizationType, SportType } from "../../../lib/db.types";
import {
  completeOnboarding,
  type OnboardingAthleteInput,
} from "../actions";

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

const sportFieldConfig: Record<
  SportType,
  {
    numberLabel: string;
    numberPlaceholder: string;
    positionLabel: string;
    positionPlaceholder: string;
    positionOptions: string[];
    dominantSideLabel: string;
    dominantSideOptions: string[];
  }
> = {
  football: {
    numberLabel: "Jersey number",
    numberPlaceholder: "8",
    positionLabel: "Position",
    positionPlaceholder: "Midfielder",
    positionOptions: [
      "Goalkeeper",
      "Defender",
      "Full-back",
      "Midfielder",
      "Winger",
      "Forward",
      "Striker",
    ],
    dominantSideLabel: "Dominant foot",
    dominantSideOptions: ["Right foot", "Left foot", "Both"],
  },
  basketball: {
    numberLabel: "Jersey number",
    numberPlaceholder: "11",
    positionLabel: "Position",
    positionPlaceholder: "Guard",
    positionOptions: ["Point guard", "Shooting guard", "Wing", "Forward", "Center"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  volleyball: {
    numberLabel: "Jersey number",
    numberPlaceholder: "7",
    positionLabel: "Role",
    positionPlaceholder: "Outside hitter",
    positionOptions: [
      "Setter",
      "Outside hitter",
      "Opposite",
      "Middle blocker",
      "Libero",
    ],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  handball: {
    numberLabel: "Jersey number",
    numberPlaceholder: "9",
    positionLabel: "Position",
    positionPlaceholder: "Back",
    positionOptions: ["Goalkeeper", "Wing", "Back", "Center back", "Pivot"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  running: {
    numberLabel: "Bib number",
    numberPlaceholder: "21",
    positionLabel: "Discipline",
    positionPlaceholder: "Middle distance",
    positionOptions: ["Sprint", "Middle distance", "Long distance", "Trail", "Road"],
    dominantSideLabel: "Preferred side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  fitness: {
    numberLabel: "Member number",
    numberPlaceholder: "4",
    positionLabel: "Focus area",
    positionPlaceholder: "Strength",
    positionOptions: ["Strength", "Conditioning", "Mobility", "Recovery"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  tennis: {
    numberLabel: "Seed number",
    numberPlaceholder: "3",
    positionLabel: "Play style",
    positionPlaceholder: "Baseline",
    positionOptions: ["Baseline", "Serve and volley", "All-court", "Counterpuncher"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  swimming: {
    numberLabel: "Lane number",
    numberPlaceholder: "5",
    positionLabel: "Stroke",
    positionPlaceholder: "Freestyle",
    positionOptions: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Medley"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  martial_arts: {
    numberLabel: "Athlete number",
    numberPlaceholder: "12",
    positionLabel: "Style",
    positionPlaceholder: "Striker",
    positionOptions: ["Striker", "Grappler", "All-rounder", "Defensive"],
    dominantSideLabel: "Stance",
    dominantSideOptions: ["Orthodox", "Southpaw", "Switch"],
  },
  esports: {
    numberLabel: "Player number",
    numberPlaceholder: "10",
    positionLabel: "Role",
    positionPlaceholder: "Support",
    positionOptions: ["Captain", "Entry", "Support", "Flex", "IGL"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  other: {
    numberLabel: "Player number",
    numberPlaceholder: "1",
    positionLabel: "Role",
    positionPlaceholder: "Role",
    positionOptions: ["Starter", "Rotation", "Development", "Other"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
};

const steps = ["Welcome", "Organization", "First team", "Athletes", "Ready"];

type OrganizationForm = {
  name: string;
  type: OrganizationType;
  city: string;
  country: string;
};

type TeamForm = {
  name: string;
  sportType: SportType;
  ageGroup: string;
  level: string;
  seasonGoal: string;
  weeklyTrainingCount: string;
};

const emptyAthlete: OnboardingAthleteInput = {
  firstName: "",
  lastName: "",
  email: "",
  number: "",
  position: "",
  dominantSide: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </label>
  );
}

function inputClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function OnboardingStepper() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [organization, setOrganization] = useState<OrganizationForm>({
    name: "",
    type: "club",
    city: "",
    country: "",
  });
  const [team, setTeam] = useState<TeamForm>({
    name: "",
    sportType: "football",
    ageGroup: "",
    level: "",
    seasonGoal: "",
    weeklyTrainingCount: "",
  });
  const [athletes, setAthletes] = useState<OnboardingAthleteInput[]>([
    { ...emptyAthlete },
    { ...emptyAthlete },
    { ...emptyAthlete },
  ]);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return organization.name.trim().length > 1;
    }

    if (step === 2) {
      return team.name.trim().length > 1;
    }

    return true;
  }, [organization.name, step, team.name]);

  function updateAthlete(
    index: number,
    key: keyof OnboardingAthleteInput,
    value: string,
  ) {
    setAthletes((current) =>
      current.map((athlete, athleteIndex) =>
        athleteIndex === index ? { ...athlete, [key]: value } : athlete,
      ),
    );
  }

  function addAthleteRow() {
    setAthletes((current) => [...current, { ...emptyAthlete }].slice(0, 12));
  }

  function removeAthleteRow(index: number) {
    setAthletes((current) =>
      current.filter((_, athleteIndex) => athleteIndex !== index),
    );
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await completeOnboarding({
        organization,
        team,
        athletes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    });
  }

  const athleteFieldConfig = sportFieldConfig[team.sportType];

  return (
    <section className="w-full rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div>
        <div>
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
            <Icon icon="solar:stars-bold" className="size-5" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Let&apos;s build your team foundation
          </h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
            Welcome, coach. First we&apos;ll learn about your organization and
            first team, then we&apos;ll set up a system that gets smarter after
            every session.
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{steps[step]}</span>
            <span>
              {step + 1} / {steps.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {step === 0 ? (
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-base font-extrabold text-foreground">
              Doctor Panda is ready.
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
              This flow takes about two minutes. We&apos;ll create your
              organization, first team and optional athlete profiles. Athletes
              can connect their own accounts later through invite links.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Organization name</FieldLabel>
              <input
                className={inputClassName()}
                value={organization.name}
                onChange={(event) =>
                  setOrganization((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ankara Youth Sports Academy"
              />
            </div>
            <div>
              <FieldLabel>Organization type</FieldLabel>
              <select
                className={inputClassName()}
                value={organization.type}
                onChange={(event) =>
                  setOrganization((current) => ({
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
              <FieldLabel>City</FieldLabel>
              <input
                className={inputClassName()}
                value={organization.city}
                onChange={(event) =>
                  setOrganization((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                placeholder="Ankara"
              />
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <input
                className={inputClassName()}
                value={organization.country}
                onChange={(event) =>
                  setOrganization((current) => ({
                    ...current,
                    country: event.target.value,
                  }))
                }
                placeholder="Turkey"
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Team name</FieldLabel>
              <input
                className={inputClassName()}
                value={team.name}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="U17 Football Team"
              />
            </div>
            <div>
              <FieldLabel>Sport type</FieldLabel>
              <select
                className={inputClassName()}
                value={team.sportType}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    sportType: event.target.value as SportType,
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
              <FieldLabel>Age group</FieldLabel>
              <input
                className={inputClassName()}
                value={team.ageGroup}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    ageGroup: event.target.value,
                  }))
                }
                placeholder="U17"
              />
            </div>
            <div>
              <FieldLabel>Level</FieldLabel>
              <input
                className={inputClassName()}
                value={team.level}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
                placeholder="Academy"
              />
            </div>
            <div>
              <FieldLabel>Weekly training count</FieldLabel>
              <input
                type="number"
                min="0"
                step="1"
                className={inputClassName()}
                value={team.weeklyTrainingCount}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    weeklyTrainingCount: event.target.value,
                  }))
                }
                placeholder="4"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Season goal</FieldLabel>
              <textarea
                className={`${inputClassName()} min-h-24 resize-none`}
                value={team.seasonGoal}
                onChange={(event) =>
                  setTeam((current) => ({
                    ...current,
                    seasonGoal: event.target.value,
                  }))
                }
                placeholder="Improve transition defense and track player development systematically."
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <div className="mb-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-bold text-foreground">
                You can add athletes now or leave this empty and add them later.
              </p>
              <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
                These profiles are created without user accounts. The
                invite/claim flow will be connected in a later phase.
              </p>
            </div>

            <div className="grid gap-3">
              {athletes.map((athlete, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Athlete {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeAthleteRow(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive-foreground"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="size-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className={inputClassName()}
                      value={athlete.firstName}
                      onChange={(event) =>
                        updateAthlete(index, "firstName", event.target.value)
                      }
                      placeholder="First name"
                    />
                    <input
                      className={inputClassName()}
                      value={athlete.lastName}
                      onChange={(event) =>
                        updateAthlete(index, "lastName", event.target.value)
                      }
                      placeholder="Last name"
                    />
                    <input
                      type="email"
                      className={inputClassName()}
                      value={athlete.email}
                      onChange={(event) =>
                        updateAthlete(index, "email", event.target.value)
                      }
                      placeholder="athlete@example.com"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={inputClassName()}
                      value={athlete.number}
                      onChange={(event) =>
                        updateAthlete(index, "number", event.target.value)
                      }
                      placeholder={athleteFieldConfig.numberPlaceholder}
                      aria-label={athleteFieldConfig.numberLabel}
                    />
                    <select
                      className={inputClassName()}
                      value={athlete.position}
                      onChange={(event) =>
                        updateAthlete(index, "position", event.target.value)
                      }
                      aria-label={athleteFieldConfig.positionLabel}
                    >
                      <option value="">
                        {athleteFieldConfig.positionPlaceholder}
                      </option>
                      {athleteFieldConfig.positionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputClassName()}
                      value={athlete.dominantSide}
                      onChange={(event) =>
                        updateAthlete(index, "dominantSide", event.target.value)
                      }
                      aria-label={athleteFieldConfig.dominantSideLabel}
                    >
                      <option value="">
                        {athleteFieldConfig.dominantSideLabel}
                      </option>
                      {athleteFieldConfig.dominantSideOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAthleteRow}
              className="mt-4 rounded-2xl border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary"
            >
              Add another athlete
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-3xl border border-border bg-background p-5">
            <p className="text-base font-extrabold text-foreground">
              Great. We&apos;re ready to save.
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
              Organization: <strong>{organization.name}</strong>
              <br />
              Team: <strong>{team.name}</strong>
              <br />
              Athletes:{" "}
              <strong>
                {athletes.filter((athlete) => athlete.firstName?.trim()).length}
              </strong>
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive-soft p-3 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || isPending}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(current + 1, 4))}
            disabled={!canContinue || isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating workspace..." : "Create workspace"}
          </button>
        )}
      </div>
    </section>
  );
}


