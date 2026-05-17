import { auth } from "@clerk/nextjs/server";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

import { listAthleteApplications } from "../../../actions/coach-network-applications";
import { listAthleteOffers } from "../../../actions/coach-network-offers";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AthleteApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; offerAccepted?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/applications");
  }

  const { submitted, offerAccepted } = await searchParams;
  const [applications, offers] = await Promise.all([
    listAthleteApplications(),
    listAthleteOffers(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">My applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track coach responses and next steps for your remote coaching requests.
          </p>
        </div>
        <Button asChild>
          <Link href="/find-coach">Find a coach</Link>
        </Button>
      </div>

      {submitted ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Application submitted. The coach will review it in their inbox.
        </p>
      ) : null}

      {offerAccepted ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Offer accepted. Your coach will confirm payment and add you to their roster.
        </p>
      ) : null}

      {offers.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-foreground">Coaching offers</h2>
          <ul className="mt-4 space-y-3">
            {offers.map((offer) => (
              <li key={offer.id}>
                <Link
                  href={`/athlete/offers/${offer.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-extrabold text-foreground">{offer.title}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                      {formatStatus(offer.status)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">View →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {applications.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            You have not applied to any coaches yet.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold text-foreground">
                    {application.coach_profile?.display_name ?? "Coach"}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {formatStatus(application.status)}
                  </p>
                </div>
                {application.coach_profile?.slug ? (
                  <Link
                    href={`/coach-network/coaches/${application.coach_profile.slug}`}
                    className="text-sm font-semibold text-primary"
                  >
                    View profile
                  </Link>
                ) : null}
              </div>
              {application.athlete_message ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {application.athlete_message}
                </p>
              ) : null}
              {application.coach_response ? (
                <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
                  <span className="font-bold">Coach: </span>
                  {application.coach_response}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                Submitted{" "}
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleString()
                  : "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
