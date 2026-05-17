"use client";

import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCoachNetworkApplication } from "../../../../../actions/coach-network-applications";
import type { CoachNetworkApplicationFormData } from "../../../../../../lib/coach-network/application-types";

type PackageOption = {
  id: string;
  title: string;
  description: string | null;
};

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function labelClassName() {
  return "text-sm font-bold text-foreground";
}

export function CoachApplicationForm({
  coachProfileId,
  coachName,
  packages,
  defaultPackageId,
}: {
  coachProfileId: string;
  coachName: string;
  packages: PackageOption[];
  defaultPackageId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [consents, setConsents] = useState({
    shareProfile: false,
    shareGoals: false,
    shareContact: false,
    acceptedTerms: false,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload: CoachNetworkApplicationFormData = {
      consents: {
        ...consents,
        acceptedAt: new Date().toISOString(),
      },
      experienceLevel: String(
        formData.get("experienceLevel") ?? "beginner",
      ) as CoachNetworkApplicationFormData["experienceLevel"],
      weeklyAvailability: String(formData.get("weeklyAvailability") ?? ""),
      injuriesOrConstraints:
        String(formData.get("injuriesOrConstraints") ?? "").trim() || undefined,
      preferredPackageId:
        String(formData.get("preferredPackageId") ?? "") || null,
    };

    startTransition(async () => {
      const result = await createCoachNetworkApplication({
        coachProfileId,
        packageId: payload.preferredPackageId,
        athleteMessage: String(formData.get("athleteMessage") ?? ""),
        formData: payload,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/athlete/applications?submitted=${result.applicationId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Applying to{" "}
        <span className="font-bold text-foreground">{coachName}</span>
      </p>

      <div>
        <label htmlFor="athleteMessage" className={labelClassName()}>
          Why do you want this coach?
        </label>
        <textarea
          id="athleteMessage"
          name="athleteMessage"
          required
          rows={5}
          className={`${fieldClassName()} min-h-32`}
          placeholder="Your goals, timeline, and what you hope to get from remote coaching."
        />
      </div>

      <div>
        <label htmlFor="experienceLevel" className={labelClassName()}>
          Experience level
        </label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          className={fieldClassName()}
          defaultValue="intermediate"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label htmlFor="weeklyAvailability" className={labelClassName()}>
          Weekly availability
        </label>
        <input
          id="weeklyAvailability"
          name="weeklyAvailability"
          required
          className={fieldClassName()}
          placeholder="e.g. 4 sessions / week, evenings UTC+3"
        />
      </div>

      <div>
        <label htmlFor="injuriesOrConstraints" className={labelClassName()}>
          Injuries or constraints (optional)
        </label>
        <textarea
          id="injuriesOrConstraints"
          name="injuriesOrConstraints"
          rows={3}
          className={fieldClassName()}
          placeholder="Anything your coach should know upfront."
        />
      </div>

      {packages.length > 0 ? (
        <div>
          <label htmlFor="preferredPackageId" className={labelClassName()}>
            Preferred package
          </label>
          <select
            id="preferredPackageId"
            name="preferredPackageId"
            className={fieldClassName()}
            defaultValue={defaultPackageId ?? ""}
          >
            <option value="">No preference</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <fieldset className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-sm font-extrabold text-foreground">
          Data sharing consent
        </legend>
        {(
          [
            ["shareProfile", "Share my marketplace profile with this coach"],
            [
              "shareGoals",
              "Share my goals and sport interests from onboarding",
            ],
            [
              "shareContact",
              "Allow this coach to contact me about this application",
            ],
            [
              "acceptedTerms",
              "I understand this is not medical advice and coaching is at the coach's discretion",
            ],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-start gap-3 text-sm font-medium"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-border"
              checked={consents[key]}
              onChange={(event) =>
                setConsents((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-foreground">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit application"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/find-coach">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
