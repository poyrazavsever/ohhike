import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { ReactNode } from "react";

import { buildAppUrl, getAppBaseUrl } from "../../../../lib/app-url";
import { ClaimAthletePanel } from "./claim-athlete-panel";
import { getAthleteInvitePreview } from "../../../../lib/athlete-invite";

async function absoluteInviteUrl(token: string) {
  return buildAppUrl(await getAppBaseUrl(), `/invite/athlete/${token}`);
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

export default async function AthleteInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getAthleteInvitePreview(token);
  const { userId } = await auth();
  const claimReturnUrl = await absoluteInviteUrl(token);

  if (!preview.ok) {
    if (preview.reason === "expired") {
      return (
        <InviteProblem title="This invite expired">
          Ask your coach to send a new claim link from the Athletes page.
        </InviteProblem>
      );
    }
    if (preview.reason === "already_claimed") {
      return (
        <InviteProblem title="Already connected">
          This profile has already been linked to an account. Sign in with that
          account to continue.
        </InviteProblem>
      );
    }
    return (
      <InviteProblem title="Link not valid">
        Check that you opened the full URL from your coach. If it keeps
        failing, request a new invite.
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
          Claim your athlete profile
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
          Hi {preview.athleteFirstName}, connect your account to{" "}
          <span className="font-bold text-foreground">
            {preview.organizationName}
          </span>{" "}
          so you can use check-ins and personal data with your coach.
        </p>
        {expiryLabel ? (
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Invite valid until {expiryLabel}.
          </p>
        ) : null}

        <div className="mt-6">
          <ClaimAthletePanel
            token={token}
            isSignedIn={Boolean(userId)}
            returnUrl={claimReturnUrl}
          />
        </div>

        {userId ? null : (
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            After signing in, you will return here to finish connecting your
            profile.
          </p>
        )}
      </div>
    </div>
  );
}
