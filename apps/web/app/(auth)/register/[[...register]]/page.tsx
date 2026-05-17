import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { AuthShell } from "../../../../components/auth/auth-shell";
import { authAppearance } from "../../../../components/auth/clerk-appearance";
import { isCoachNetworkEnabled } from "../../../../lib/coach-network";

export default function RegisterPage() {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  return (
    <AuthShell mode="register">
      <SignUp
        path="/register"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/account-type"
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
