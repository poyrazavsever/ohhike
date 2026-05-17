"use client";

import { Purchases, type Package } from "@revenuecat/purchases-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { syncRevenueCatBillingAction } from "../../../../actions/billing";

type RevenueCatTestCheckoutProps = {
  apiKey: string;
  appUserId: string;
  currentPlan: string;
};

function formatPrice(pkg: Package) {
  const product = pkg.webBillingProduct;
  const period = product.period
    ? `${product.period.number} ${product.period.unit}${
        product.period.number === 1 ? "" : "s"
      }`
    : "purchase";
  return `${product.price.formattedPrice} / ${period}`;
}

export function RevenueCatTestCheckout({
  apiKey,
  appUserId,
  currentPlan,
}: RevenueCatTestCheckoutProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadOfferings() {
      try {
        const purchases = Purchases.isConfigured()
          ? Purchases.getSharedInstance()
          : Purchases.configure({ apiKey, appUserId });
        const offerings = await purchases.getOfferings();

        if (!cancelled) {
          setPackages(offerings.current?.availablePackages ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load RevenueCat offerings.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOfferings();

    return () => {
      cancelled = true;
    };
  }, [apiKey, appUserId]);

  function purchase(pkg: Package) {
    setError(null);
    setStatus(null);

    startTransition(async () => {
      try {
        await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
        const result = await syncRevenueCatBillingAction();

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setStatus(`Synced RevenueCat plan: ${result.plan}.`);
        router.refresh();
      } catch (purchaseError) {
        setError(
          purchaseError instanceof Error
            ? purchaseError.message
            : "Purchase flow could not be completed.",
        );
      }
    });
  }

  return (
    <section className="mt-4 rounded-2xl border border-primary/20 bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black text-foreground">
            RevenueCat test checkout
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Test Store only. Current Supabase plan: {currentPlan}.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await syncRevenueCatBillingAction();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setStatus(`Synced RevenueCat plan: ${result.plan}.`);
              router.refresh();
            });
          }}
          className="rounded-xl border border-border px-3 py-2 text-sm font-extrabold text-foreground transition-colors hover:border-primary hover:text-primary-700 disabled:opacity-60"
        >
          Sync access
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {loading ? (
          <p className="rounded-xl bg-background p-4 text-sm font-semibold text-muted-foreground">
            Loading test offerings...
          </p>
        ) : packages.length > 0 ? (
          packages.map((pkg) => (
            <button
              key={pkg.identifier}
              type="button"
              disabled={pending}
              onClick={() => purchase(pkg)}
              className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
            >
              <p className="text-sm font-black text-foreground">
                {pkg.webBillingProduct.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {formatPrice(pkg)}
              </p>
            </button>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-background p-4 text-sm font-semibold text-muted-foreground">
            No current RevenueCat offering with purchasable packages found.
          </p>
        )}
      </div>

      {status ? (
        <p className="mt-4 rounded-xl border border-success/30 bg-success-soft p-3 text-sm font-bold text-success-foreground">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm font-bold text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </section>
  );
}
