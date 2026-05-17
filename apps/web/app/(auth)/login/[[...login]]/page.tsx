import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { AuthShell } from "../../../../components/auth/auth-shell";
import { authAppearance } from "../../../../components/auth/clerk-appearance";
import { isCoachNetworkEnabled } from "../../../../lib/coach-network";

export default function LoginPage() {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  return (
    <AuthShell mode="login">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        fallbackRedirectUrl="/account-type"
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
