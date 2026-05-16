import Link from "next/link";

import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getAthletePortalContext } from "../../../../lib/athlete-portal";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-bold text-foreground">{value || "—"}</span>
    </div>
  );
}

export default async function AthleteProfilePage() {
  const { athlete, teamName, workspace } = await getAthletePortalContext();

  const displayName =
    athlete.display_name ??
    ([athlete.first_name, athlete.last_name].filter(Boolean).join(" ") ||
      "Athlete");

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={teamName ?? workspace.organization.name}
        title="My profile"
        subtitle="Roster details shared with your coaching staff."
        mascotSrc="/maskotlar/kosu.png"
      />

      <div className="mt-6 max-w-xl rounded-3xl border border-border bg-card px-5">
        <DetailRow label="Name" value={displayName} />
        <DetailRow label="Position" value={athlete.position ?? ""} />
        <DetailRow label="Dominant side" value={athlete.dominant_side ?? ""} />
        <DetailRow label="Phone" value={athlete.phone ?? ""} />
        <DetailRow label="Status" value={athlete.status ?? ""} />
      </div>

      <p className="mt-6 text-sm font-medium text-muted-foreground">
        To change your sign-in email or password, use{" "}
        <Link href="/settings/profile" className="font-bold text-primary">
          account settings
        </Link>
        .
      </p>
    </section>
  );
}
