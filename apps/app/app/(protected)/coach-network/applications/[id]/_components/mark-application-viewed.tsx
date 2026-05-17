"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { markCoachNetworkApplicationViewed } from "../../../../../actions/coach-network";

export function MarkApplicationViewed({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current || status !== "submitted") {
      return;
    }

    didRunRef.current = true;

    void markCoachNetworkApplicationViewed(applicationId).then((result) => {
      if (result.ok) {
        router.refresh();
      }
    });
  }, [applicationId, router, status]);

  return null;
}
