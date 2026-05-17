import Link from "next/link";

import { listCoachNetworkApplicationsForWorkspace } from "../../../actions/coach-network";
import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function CoachNetworkApplicationsPage() {
  const applications = await listCoachNetworkApplicationsForWorkspace();
  const submittedCount = applications.filter(
    (application) => application.status === "submitted",
  ).length;
  const underReviewCount = applications.filter(
    (application) => application.status === "under_review",
  ).length;
  const acceptedCount = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Applications"
        subtitle="Review athletes who applied to your public coaching profile and move qualified leads forward."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Applications"
          value={applications.length.toString()}
          helper="Total received"
          icon="solar:document-text-bold"
        />
        <MetricCard
          label="Needs review"
          value={(submittedCount + underReviewCount).toString()}
          helper={`${submittedCount} newly submitted`}
          icon="solar:inbox-bold"
          tone="warning"
        />
        <MetricCard
          label="Accepted"
          value={acceptedCount.toString()}
          helper="Converted athletes"
          icon="solar:user-check-rounded-bold"
          tone="secondary"
        />
      </div>

      {applications.length === 0 ? (
        <EmptyStateCard
          title="No applications yet"
          description="Publish your marketplace profile to start receiving athlete requests."
          icon="solar:inbox-bold"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.35fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Athlete</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          <ul className="divide-y divide-border">
            {applications.map((application) => {
              const athleteProfile = Array.isArray(
                application.athlete_marketplace_profiles,
              )
                ? application.athlete_marketplace_profiles[0]
                : application.athlete_marketplace_profiles;
              const user = Array.isArray(application.users)
                ? application.users[0]
                : application.users;

              const athleteName =
                athleteProfile?.display_name ??
                user?.display_name ??
                user?.email ??
                "Athlete";

              return (
                <li key={application.id}>
                  <Link
                    href={`/coach-network/applications/${application.id}`}
                    className="grid gap-3 px-4 py-3 transition-colors hover:bg-background md:grid-cols-[1.35fr_1fr_auto] md:items-center md:gap-4"
                  >
                    <div>
                      <p className="text-sm font-black text-foreground">
                        {athleteName}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-muted-foreground">
                        {application.athlete_message ?? "No message"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                        {formatStatus(application.status)}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {application.submitted_at
                        ? new Date(
                            application.submitted_at,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
