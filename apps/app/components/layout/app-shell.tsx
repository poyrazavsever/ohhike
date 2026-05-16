import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <AppSidebar />
      <main className="min-h-svh lg:pl-72">{children}</main>
    </div>
  );
}
