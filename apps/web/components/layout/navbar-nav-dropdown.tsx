"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export type NavDropdownItem = {
  href: string;
  label: string;
  description: string;
};

export function NavDropdown({
  items,
  label,
  align = "center",
}: {
  items: NavDropdownItem[];
  label: string;
  align?: "center" | "end";
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-haspopup="menu"
      >
        {label}
        <Icon
          icon="solar:alt-arrow-down-linear"
          className="size-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
        />
      </button>

      <div
        className={cn(
          "invisible absolute top-full z-50 mt-3 w-72 rounded-xl border border-border bg-background p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
          align === "end" ? "right-0" : "left-1/2 -translate-x-1/2",
        )}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <span className="block text-sm font-semibold text-foreground">
              {item.label}
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
