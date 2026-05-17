import { notFound } from "next/navigation";

import { isCoachNetworkEnabled } from "../../../lib/coach-network";

export default function CoachNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isCoachNetworkEnabled()) {
    notFound();
  }

  return children;
}
