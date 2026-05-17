"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  acceptCoachNetworkOffer,
  declineCoachNetworkOffer,
} from "../../../../../actions/coach-network-offers";

export function AthleteOfferActions({
  offerId,
  status,
}: {
  offerId: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canRespond = status === "sent";

  function respond(action: "accept" | "decline") {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result =
        action === "accept"
          ? await acceptCoachNetworkOffer(offerId)
          : await declineCoachNetworkOffer(offerId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        action === "accept"
          ? "Offer accepted. Your coach will confirm payment and add you to their roster."
          : "Offer declined.",
      );
      router.refresh();
    });
  }

  if (!canRespond) {
    return (
      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        This offer is {status.replaceAll("_", " ")}.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond("accept")}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {isPending ? "Working…" : "Accept offer"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond("decline")}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-extrabold hover:bg-muted disabled:opacity-60"
      >
        Decline
      </button>
      {message ? <p className="w-full text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
