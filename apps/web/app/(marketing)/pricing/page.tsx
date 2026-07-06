"use client";

import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
          <span>SaaS MVP</span>
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-foreground sm:text-5xl">
          Pricing Plans
        </h1>
        <p className="mt-4 max-w-md text-lg font-medium text-muted-foreground">
          OhHike CoachOS is currently in its early MVP phase and is completely free to use. Premium features and billing will be available soon.
        </p>
      </motion.div>
    </main>
  );
}
