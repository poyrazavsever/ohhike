// @ts-nocheck
"use client";

const useUser = () => ({ user: null }); const useAuth = () => ({ userId: "temp", getToken: async () => "" }); const useClerk = () => ({ signOut: () => {} });
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { claimAthleteProfile } from "../../../actions/workspace";

export function ClaimAthletePanel({
  token,
  isSignedIn,
  returnUrl,
}: {
  token: string;
  isSignedIn: boolean;
  returnUrl: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function claim() {
    setError(null);
    startTransition(async () => {
      const result = await claimAthleteProfile(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/athlete/onboarding");
      router.refresh();
    });
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-3">
        <SignInButton mode="modal" forceRedirectUrl={returnUrl}>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Icon icon="solar:login-3-bold" className="size-4" />
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl={returnUrl}>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary"
          >
            <Icon icon="solar:user-plus-bold" className="size-4" />
            Create account
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={claim}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:link-bold" className="size-4" />
        {isPending ? "Connectingâ€¦" : "Connect this profile to my account"}
      </button>
      {error ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
          {error}
        </div>
      ) : null}
    </div>
  );
}


