import type { ReactNode } from "react";

import type { WorkspaceShellData } from "../../lib/workspace";
import { AppSidebar } from "./app-sidebar";

export function AppShell({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: WorkspaceShellData;
}) {
  return (
    <div className="min-h-svh bg-background">
      <AppSidebar workspace={workspace} />
      <main className="min-h-svh lg:pl-72">{children}</main>
    </div>
  );
}
