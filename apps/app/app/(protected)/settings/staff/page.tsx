import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { formatOrganizationRole, isCoachStaffRole } from "../../../../lib/org-roles";
import { getStaffSettingsData } from "../../../../lib/workspace";
import { SettingsNotice } from "../_components/settings-notice";
import { StaffInvitePanel } from "./_components/staff-invite-panel";

function formatJoined(iso: string | null) {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

export default async function StaffSettingsPage() {
  const { members, pendingInvites, teams, canManage } =
    await getStaffSettingsData();

  const staffMembers = members.filter(
    (member) =>
      member.is_active &&
      (isCoachStaffRole(member.role) || member.role === "viewer"),
  );

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Staff"
        subtitle="Invite coaches and staff, assign roles, and see who has access to this organization."
        mascotSrc="/maskotlar/kutlama.png"
      />

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-extrabold text-foreground">
          Active staff ({staffMembers.length})
        </p>
        {staffMembers.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            No staff members yet. Send an invite link below.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {staffMembers.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {member.displayName ?? member.email ?? member.user_id}
                  </p>
                  {member.displayName && member.email ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      {member.email}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
                    {formatOrganizationRole(member.role)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Joined {formatJoined(member.joined_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage ? (
        <StaffInvitePanel teams={teams} pendingInvites={pendingInvites} />
      ) : (
        <div className="mt-4">
          <SettingsNotice
            title="View only"
            body="Only organization owners and admins can create or revoke staff invites. Ask an admin if you need to add someone."
          />
        </div>
      )}
    </section>
  );
}
