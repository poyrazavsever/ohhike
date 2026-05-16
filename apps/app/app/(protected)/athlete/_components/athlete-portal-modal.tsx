"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

type AthletePortalFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: string;
  closeAriaLabel: string;
  maxWidthClassName?: string;
  children: ReactNode;
  error: string | null;
  isPending: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

export function AthletePortalFormModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  closeAriaLabel,
  maxWidthClassName = "max-w-3xl",
  children,
  error,
  isPending,
  submitLabel,
  onSubmit,
}: AthletePortalFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label={closeAriaLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        className={`relative z-10 max-h-[90svh] w-full ${maxWidthClassName} overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
              <Icon icon={icon} className="size-5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground">{title}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Icon icon="solar:close-circle-bold" className="size-3.5" />
            Close
          </button>
        </div>

        {children}

        {error ? (
          <p className="mt-4 text-sm font-bold text-destructive">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
          >
            <Icon icon="solar:diskette-bold" className="size-4" />
            {isPending ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
