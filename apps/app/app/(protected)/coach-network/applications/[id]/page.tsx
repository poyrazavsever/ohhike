import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCoachNetworkApplicationDetail } from "../../../../actions/coach-network";
import {
  listCoachingPackagesForWorkspace,
  listOffersForApplication,
} from "../../../../actions/coach-network-offers";
import {
  DashboardHero,
  DetailStat,
} from "../../../../../components/dashboard/dashboard-cards";
import { buildCoachApplicationSummary } from "../../../../../lib/coach-network/application-summary";
import { ApplicationDetailActions } from "./_components/application-detail-actions";
import { MarkApplicationViewed } from "./_components/mark-application-viewed";
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

  const athleteName =
    athleteProfile?.display_name ??
    user?.display_name ??
    user?.email ??
    "Athlete application";

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <MarkApplicationViewed applicationId={id} status={application.status} />

      <Link
        href="/coach-network/applications"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" className="size-4" />
        Back to applications
      </Link>

      <div className="mt-4">
        <DashboardHero
          eyebrow="Coach Network"
          title={athleteName}
          subtitle={`Application status: ${formatStatus(application.status)}`}
          mascotSrc="/maskotlar/gozetleme.png"
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat label="Email" value={user?.email ?? "Not provided"} />
        <DetailStat
          label="Submitted"
          value={
            application.submitted_at
              ? new Date(application.submitted_at).toLocaleDateString()
              : "Not submitted"
          }
        />
        <DetailStat label="Status" value={formatStatus(application.status)} />
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Application summary
        </h2>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
          {summary}
        </pre>
      </section>

      {application.athlete_message ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">
            Athlete message
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {application.athlete_message}
          </p>
        </section>
      ) : null}

      {consents ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">
            Shared consents
          </h2>
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
        <section className="mt-4 rounded-2xl border border-border bg-background p-5">
          <h2 className="text-sm font-extrabold text-foreground">
            Your last response
          </h2>
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
    </section>
  );
}
