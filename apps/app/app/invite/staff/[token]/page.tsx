const auth = () => ({ userId: "temp" }); const currentUser = () => ({});
import Link from "next/link";
import type { ReactNode } from "react";

import { buildAppUrl, getAppBaseUrl } from "../../../../lib/app-url";
import { ClaimStaffPanel } from "./claim-staff-panel";
import { getStaffInvitePreview } from "../../../../lib/staff-invite";

async function absoluteInviteUrl(token: string) {
  return buildAppUrl(await getAppBaseUrl(), `/invite/staff/${token}`);
}

function formatExpiry(iso: string | null) {
  if (!iso) {
    return null;
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function InviteProblem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-primary-50 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-black text-foreground">{title}</h1>
        <div className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          {children}
        </div>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

export default async function StaffInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getStaffInvitePreview(token);
  const { userId } = await auth();
  const claimReturnUrl = await absoluteInviteUrl(token);

  if (!preview.ok) {
    if (preview.reason === "expired") {
      return (
        <InviteProblem title="This invite expired">
          Ask an organization admin to send a new staff invite from Settings â†’
          Staff.
        </InviteProblem>
      );
    }
    if (preview.reason === "already_claimed") {
      return (
        <InviteProblem title="Already used">
          This invite has already been accepted. Sign in with your staff account
          to open the dashboard.
        </InviteProblem>
      );
    }
    return (
      <InviteProblem title="Link not valid">
        Check that you opened the full URL from your admin. If it keeps failing,
        request a new invite.
      </InviteProblem>
    );
  }

  const expiryLabel = formatExpiry(preview.expiresAt);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-primary-50 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
          OhHike CoachOS
        </p>
        <h1 className="mt-2 text-xl font-black text-foreground">
          Join as staff
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          Accept your invite to{" "}
          <span className="font-bold text-foreground">
            {preview.organizationName}
          </span>{" "}
          as{" "}
          <span className="font-bold text-foreground">
            {preview.roleLabel}
          </span>
          .
        </p>
        {expiryLabel ? (
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Invite valid until {expiryLabel}.
          </p>
        ) : null}

        <div className="mt-6">
          <ClaimStaffPanel
            token={token}
            isSignedIn={Boolean(userId)}
            returnUrl={claimReturnUrl}
          />
        </div>

        {userId ? null : (
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            After signing in, you will return here to finish joining the
            organization.
          </p>
        )}
      </div>
    </div>
  );
}

