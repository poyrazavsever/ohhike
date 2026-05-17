import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAthleteOffer } from "../../../../actions/coach-network-offers";
import { AthleteOfferActions } from "./_components/athlete-offer-actions";

type AthleteOfferPageProps = {
  params: Promise<{ offerId: string }>;
};

export default async function AthleteOfferPage({ params }: AthleteOfferPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect_url=/athlete/applications");
  }

  const { offerId } = await params;
  const offer = await getAthleteOffer(offerId);

  if (!offer) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <Link
        href="/athlete/applications"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← My applications
      </Link>

      <header className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Coaching offer · {offer.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">{offer.title}</h1>
        {offer.price_cents ? (
          <p className="mt-2 text-lg font-bold text-foreground">
            {(offer.price_cents / 100).toFixed(2)} {offer.currency}
          </p>
        ) : null}
      </header>

      {offer.description ? (
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">Description</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {offer.description}
          </p>
        </section>
      ) : null}

      {offer.terms ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">Terms</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {offer.terms}
          </p>
        </section>
      ) : null}

      <AthleteOfferActions offerId={offer.id} status={offer.status} />
    </main>
  );
}
