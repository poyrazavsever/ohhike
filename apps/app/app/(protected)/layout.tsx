import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { requireAthletePortalAccess } from "../../lib/athlete-portal";
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

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  await requireAthletePortalAccess(pathname);

  const workspace = await getWorkspaceShellData();

  return <AppShell workspace={workspace}>{children}</AppShell>;
}
