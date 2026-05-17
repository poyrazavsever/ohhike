import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { AuthShell } from "../../../../components/auth/auth-shell";
import { authAppearance } from "../../../../components/auth/clerk-appearance";
import { authRedirectTarget } from "../../../../lib/auth-redirect";
import { isCoachNetworkEnabled } from "../../../../lib/coach-network";

type LoginPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const redirectTo = authRedirectTarget(params.redirect_url, "/account-type");

  return (
    <AuthShell mode="login">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        fallbackRedirectUrl={redirectTo}
        forceRedirectUrl={redirectTo}
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
