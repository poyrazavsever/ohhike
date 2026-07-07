"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createTeam, type CreateTeamInput } from "../../../actions/workspace";
import type { SportType } from "../../../../lib/db.types";

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

export function CreateTeamForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateTeamInput>({
    name: "",
    sportType: "football",
    ageGroup: "",
    level: "",
    seasonGoal: "",
    weeklyTrainingCount: "",
  });

  function resetForm() {
    setForm({
      name: "",
      sportType: "football",
      ageGroup: "",
      level: "",
      seasonGoal: "",
      weeklyTrainingCount: "",
    });
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createTeam(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    });
  }

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  return (
    <div className="mt-6 flex justify-end">
      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val) closeModal();
        else setIsOpen(true);
      }}>
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2 font-bold rounded-xl shadow-md">
            <Icon icon="solar:add-circle-bold" className="size-5" />
            Create team
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-6 gap-6">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon icon="solar:users-group-rounded-bold" className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Create team
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-muted-foreground">
                Add another team under the active organization.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Team name"
              className="h-11"
            />
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.sportType}
              onChange={(event) =>
                setForm((current) => ({
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
            <Input
              value={form.ageGroup}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ageGroup: event.target.value,
                }))
              }
              placeholder="Age group, e.g. U17"
              className="h-11"
            />
            <Input
              value={form.level}
              onChange={(event) =>
                setForm((current) => ({ ...current, level: event.target.value }))
              }
              placeholder="Level, e.g. Academy"
              className="h-11"
            />
            <Input
              type="number"
              min="0"
              step="1"
              value={form.weeklyTrainingCount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  weeklyTrainingCount: event.target.value,
                }))
              }
              placeholder="Weekly training count"
              className="h-11"
            />
            <Input
              value={form.seasonGoal}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  seasonGoal: event.target.value,
                }))
              }
              placeholder="Season goal"
              className="h-11"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter className="mt-2 flex items-center justify-end gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="font-bold h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="gap-2 font-bold h-11 px-6 rounded-xl"
            >
              <Icon icon="solar:diskette-bold" className="size-5" />
              {isPending ? "Creating..." : "Save team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
