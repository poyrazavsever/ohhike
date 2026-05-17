"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { redeemPromoCodeAction } from "../../../../actions/billing";

export function PromoCodeForm({
  activePromoLabel,
  periodEnd,
}: {
  activePromoLabel: string | null;
  periodEnd: string | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const formattedEnd = periodEnd
    ? new Intl.DateTimeFormat("tr", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(periodEnd))
    : null;

  return (
    <section className="mt-4 rounded-xl border border-primary/25 bg-primary-soft/40 p-4">
      <p className="text-sm font-extrabold text-foreground">Promo code</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Redeem a code to unlock Pro features for your team for a limited time.
      </p>

      {activePromoLabel && formattedEnd ? (
        <p className="mt-3 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-sm font-semibold text-success-foreground">
          Active: {activePromoLabel} — valid until {formattedEnd}
        </p>
      ) : null}

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setMessage(null);

          startTransition(async () => {
            const result = await redeemPromoCodeAction(code);

            if (!result.ok) {
              setError(result.error);
              return;
            }

            setMessage(
              `${result.label} applied. Pro access until ${new Intl.DateTimeFormat("tr", {
                dateStyle: "long",
              }).format(new Date(result.periodEnd))}.`,
            );
            setCode("");
            router.refresh();
          });
        }}
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Code
          </span>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="herkesicin"
            autoComplete="off"
            spellCheck={false}
            disabled={pending}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none ring-ring/50 focus-visible:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="h-11 shrink-0 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Applying…" : "Redeem"}
        </button>
      </form>

      {error ? (
        <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm font-semibold text-success-foreground">{message}</p>
      ) : null}
    </section>
  );
}
