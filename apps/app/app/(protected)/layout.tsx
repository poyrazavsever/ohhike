import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { getWorkspaceShellData } from "../../lib/workspace";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const workspace = await getWorkspaceShellData();

  return <AppShell workspace={workspace}>{children}</AppShell>;
}
