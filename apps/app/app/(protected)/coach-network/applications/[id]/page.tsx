import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCoachNetworkApplicationDetail,
  markCoachNetworkApplicationViewed,
} from "../../../../actions/coach-network";
import {
  listCoachingPackagesForWorkspace,
  listOffersForApplication,
} from "../../../../actions/coach-network-offers";
import { buildCoachApplicationSummary } from "../../../../../lib/coach-network/application-summary";
import { ApplicationDetailActions } from "./_components/application-detail-actions";
import { SendOfferForm } from "./_components/send-offer-form";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function CoachNetworkApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  await markCoachNetworkApplicationViewed(id);

  const [application, packages, offers] = await Promise.all([
    getCoachNetworkApplicationDetail(id),
    listCoachingPackagesForWorkspace(),
    listOffersForApplication(id),
  ]);

  if (!application) {
    notFound();
  }

  const athleteProfile = Array.isArray(application.athlete_marketplace_profiles)
    ? application.athlete_marketplace_profiles[0]
    : application.athlete_marketplace_profiles;
  const user = Array.isArray(application.users)
    ? application.users[0]
    : application.users;

  const summary = buildCoachApplicationSummary({
    athleteMessage: application.athlete_message,
    formData: application.form_data,
    athleteDisplayName:
      athleteProfile?.display_name ?? user?.display_name ?? user?.email ?? null,
    athleteGoals: athleteProfile?.goals ?? null,
  });

  const formData =
    application.form_data &&
    typeof application.form_data === "object" &&
    !Array.isArray(application.form_data)
      ? (application.form_data as Record<string, unknown>)
      : {};

  const consents =
    formData.consents &&
    typeof formData.consents === "object" &&
    !Array.isArray(formData.consents)
      ? (formData.consents as Record<string, unknown>)
      : null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Link
        href="/coach-network/applications"
        className="text-sm font-semibold text-primary hover:text-primary-hover"
      >
        ← Back to applications
      </Link>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {formatStatus(application.status)}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">
          {athleteProfile?.display_name ??
            user?.display_name ??
            user?.email ??
            "Athlete application"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <section className="mt-6 rounded-3xl border border-border bg-primary-soft/40 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Application summary
        </h2>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
          {summary}
        </pre>
      </section>

      {application.athlete_message ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">Athlete message</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {application.athlete_message}
          </p>
        </section>
      ) : null}

      {consents ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">Shared consents</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {Object.entries(consents).map(([key, value]) => (
              <li key={key}>
                <span className="font-semibold text-foreground">{key}:</span>{" "}
                {String(value)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {application.coach_response ? (
        <section className="mt-6 rounded-3xl border border-border bg-muted/50 p-5">
          <h2 className="text-sm font-extrabold text-foreground">Your last response</h2>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {application.coach_response}
          </p>
        </section>
      ) : null}

      <SendOfferForm
        applicationId={application.id}
        packages={packages}
        existingOffers={offers}
      />

      <ApplicationDetailActions
        applicationId={application.id}
        status={application.status}
      />
    </main>
  );
}
