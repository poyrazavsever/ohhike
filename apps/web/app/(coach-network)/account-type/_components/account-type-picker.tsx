"use client";

import { Icon } from "@iconify/react";
import { useTransition } from "react";

import type { AccountType } from "../../../../lib/account-type";
import { setAccountTypeAction } from "../actions";

export function AccountTypePicker() {
  const [isPending, startTransition] = useTransition();

  function choose(accountType: AccountType) {
    startTransition(async () => {
      await setAccountTypeAction(accountType);
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          Get started
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">
          How will you use OhHike?
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Athletes find coaches on the web. Coaches continue to CoachOS to
          manage teams, athletes and training operations.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => choose("athlete")}
            className="rounded-2xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:opacity-60"
          >
            <Icon icon="solar:running-linear" className="size-8 text-primary" />
            <span className="mt-4 block text-lg font-extrabold text-foreground">
              I&apos;m an athlete
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              Find a remote coach, apply for packages, and message coaches.
            </span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => choose("coach")}
            className="rounded-2xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:opacity-60"
          >
            <Icon
              icon="solar:clipboard-list-linear"
              className="size-8 text-primary"
            />
            <span className="mt-4 block text-lg font-extrabold text-foreground">
              I&apos;m a coach
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              Continue to CoachOS to create your organization and teams.
            </span>
          </button>
        </div>

        {isPending && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Saving your choice...
          </p>
        )}
      </section>
    </main>
  );
}
