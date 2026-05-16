import { SignIn } from "@clerk/nextjs";

import { authAppearance } from "../../../components/auth/clerk-appearance";
import { AuthShell } from "../../../components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        fallbackRedirectUrl="/"
        appearance={authAppearance}
      />
    </AuthShell>
  );
}
