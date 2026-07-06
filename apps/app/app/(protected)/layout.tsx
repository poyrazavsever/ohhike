import { headers } from "next/headers";
import type { ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { requireAthletePortalAccess } from "../../lib/athlete-portal";
import { getApiWorkspaceShellData } from "../../lib/api-workspace";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  await requireAthletePortalAccess(pathname);

  // Yan menü (Sidebar) verilerini gerçek Express API'den çekiyoruz
  const workspace = await getApiWorkspaceShellData();

  return <AppShell workspace={workspace}>{children}</AppShell>;
}

