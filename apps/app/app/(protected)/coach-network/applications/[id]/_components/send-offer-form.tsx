"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  sendCoachNetworkOffer,
  type CoachNetworkOfferInput,
} from "../../../../../actions/coach-network-offers";
import type { Tables } from "../../../../../../lib/database.types";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function SendOfferForm({
  applicationId,
  packages,
  existingOffers,
}: {
  applicationId: string;
  packages: Tables<"coaching_packages">[];
  existingOffers: Tables<"coach_network_offers">[];
}) {
  const router = useRouter();
  const [packageId, setPackageId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState("");
  const [priceCents, setPriceCents] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasSentOffer = existingOffers.some(
    (offer) => offer.status === "sent" || offer.status === "accepted",
  );

  function applyPackage(pkgId: string) {
    setPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) {
      return;
    }
    setTitle(pkg.title);
    setDescription(pkg.description ?? "");
    setPriceCents(pkg.price_cents ? String(pkg.price_cents) : "");
    setCurrency(pkg.currency);
  }

  function submit(sendNow: boolean) {
    setMessage(null);
    setError(null);

    const input: CoachNetworkOfferInput = {
      applicationId,
      packageId: packageId || null,
      title,
      description,
      terms,
      priceCents: priceCents ? Number(priceCents) : null,
      currency,
      sendNow,
    };

    startTransition(async () => {
      const result = await sendCoachNetworkOffer(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(sendNow ? "Offer sent to athlete." : "Offer saved as draft.");
      router.refresh();
    });
  }

  if (hasSentOffer) {
    return (
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Offers
        </h2>
        <ul className="mt-4 space-y-2">
          {existingOffers.map((offer) => (
            <li
              key={offer.id}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            >
              <p className="font-extrabold text-foreground">{offer.title}</p>
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                {offer.status.replaceAll("_", " ")}
                {offer.price_cents
                  ? ` · ${(offer.price_cents / 100).toFixed(0)} ${offer.currency}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Send coaching offer
      </h2>

      {packages.length > 0 ? (
        <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
          From package (optional)
          <select
            className={fieldClassName()}
            value={packageId}
            onChange={(e) => applyPackage(e.target.value)}
          >
            <option value="">Custom offer</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Title
        <input
          className={fieldClassName()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 12-week remote coaching"
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Description
        <textarea
          className={`${fieldClassName()} min-h-20`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Terms
        <textarea
          className={`${fieldClassName()} min-h-16`}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Payment, cancellation, communication expectations…"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Price (cents)
          <input
            type="number"
            className={fieldClassName()}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Currency
          <input
            className={fieldClassName()}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(true)}
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send offer"}
        </button>
      </div>

      {message ? (
        <p className="mt-3 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-sm font-bold text-success-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-bold text-destructive-foreground">
          {error}
        </p>
      ) : null}

      {existingOffers.length > 0 ? (
        <ul className="mt-6 space-y-2 border-t border-border pt-4">
          {existingOffers.map((offer) => (
            <li key={offer.id} className="text-sm text-muted-foreground">
              Draft: {offer.title} ({offer.status})
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
