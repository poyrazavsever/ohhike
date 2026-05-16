import * as React from "react";

import { cn } from "../../lib/utils";

function Card({
  children,
  className,
  interactive = false,
  padding = "md",
  ...props
}: React.ComponentProps<"div"> & {
  interactive?: boolean;
  padding?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card",
        padding === "md" ? "p-6" : "p-8",
        interactive && "transition-colors hover:border-primary/35",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
