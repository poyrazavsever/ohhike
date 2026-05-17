"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteCoachingPackage,
  upsertCoachingPackage,
  type CoachingPackageInput,
} from "../../../../actions/coach-network-offers";
import type { Tables } from "../../../../../lib/database.types";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

const emptyForm: CoachingPackageInput = {
  title: "",
  description: "",
  durationWeeks: null,
  priceCents: null,
  currency: "USD",
  isActive: true,
  sortOrder: 0,
};

export function CoachingPackagesManager({
  initialPackages,
}: {
  initialPackages: Tables<"coaching_packages">[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<CoachingPackageInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(pkg: Tables<"coaching_packages">) {
    setEditingId(pkg.id);
    setForm({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description ?? "",
      durationWeeks: pkg.duration_weeks,
      priceCents: pkg.price_cents,
      currency: pkg.currency,
      isActive: pkg.is_active,
      sortOrder: pkg.sort_order,
    });
  }

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await upsertCoachingPackage({
        ...form,
        id: editingId ?? undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(editingId ? "Package updated." : "Package created.");
      resetForm();
      router.refresh();
    });
  }

  function remove(packageId: string) {
    startTransition(async () => {
      const result = await deleteCoachingPackage(packageId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          {editingId ? "Edit package" : "New package"}
        </h2>
        <div className="mt-4 space-y-3">
          <input
            className={fieldClassName()}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
          />
          <textarea
            className={`${fieldClassName()} min-h-20`}
            placeholder="Description"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((c) => ({ ...c, description: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={fieldClassName()}
              type="number"
              placeholder="Weeks"
              value={form.durationWeeks ?? ""}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  durationWeeks: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
            <input
              className={fieldClassName()}
              type="number"
              placeholder="Price (cents)"
              value={form.priceCents ?? ""}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  priceCents: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={save}
            className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
          >
            {isPending ? "Saving…" : editingId ? "Update" : "Add package"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 text-xs font-semibold text-muted-foreground"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </div>

      <ul className="space-y-3">
        {initialPackages.map((pkg) => (
          <li key={pkg.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-foreground">{pkg.title}</p>
                {pkg.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {pkg.is_active ? "Active" : "Inactive"}
                  {pkg.price_cents
                    ? ` · ${(pkg.price_cents / 100).toFixed(0)} ${pkg.currency}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(pkg)}
                  className="text-xs font-bold text-primary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(pkg.id)}
                  className="text-xs font-bold text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
