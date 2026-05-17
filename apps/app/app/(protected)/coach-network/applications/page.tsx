import Link from "next/link";

import { listCoachNetworkApplicationsForWorkspace } from "../../../actions/coach-network";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function CoachNetworkApplicationsPage() {
  const applications = await listCoachNetworkApplicationsForWorkspace();

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Athletes who applied to your marketplace profile appear here.
      </p>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
          No applications yet. Publish your marketplace profile to start receiving
          requests.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
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
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-extrabold text-foreground">{athleteName}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {application.athlete_message ?? "No message"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {formatStatus(application.status)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.submitted_at
                        ? new Date(application.submitted_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
