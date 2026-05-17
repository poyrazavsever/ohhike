import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { AuthShell } from "../../../../components/auth/auth-shell";
import { authAppearance } from "../../../../components/auth/clerk-appearance";
import { authRedirectTarget } from "../../../../lib/auth-redirect";
import { isCoachNetworkEnabled } from "../../../../lib/coach-network";

type RegisterPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const redirectTo = authRedirectTarget(params.redirect_url, "/account-type");

  return (
    <AuthShell mode="register">
      <SignUp
        path="/register"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl={redirectTo}
        forceRedirectUrl={redirectTo}
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
