import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { hasActiveOrganizationMembership } from "../../lib/organization-membership";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const hasMembership = await hasActiveOrganizationMembership(userId);

  if (!hasMembership) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
