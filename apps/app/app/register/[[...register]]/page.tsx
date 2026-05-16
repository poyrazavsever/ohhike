import { SignUp } from "@clerk/nextjs";

import { authAppearance } from "../../../components/auth/clerk-appearance";
import { AuthShell } from "../../../components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <SignUp
        path="/register"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/"
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
