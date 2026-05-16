"use client";

import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

const signals = [
  {
    label: "Readiness",
    value: "82%",
    detail: "7 athletes ready",
    icon: "solar:pulse-2-bold",
  },
  {
    label: "Load Risk",
    value: "3",
    detail: "watch closely",
    icon: "solar:shield-warning-bold",
  },
  {
    label: "Sleep Trend",
    value: "-11%",
    detail: "last 3 days",
    icon: "solar:moon-sleep-bold",
  },
  {
    label: "Coach Notes",
    value: "18",
    detail: "linked insights",
    icon: "solar:notes-bold",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.66,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.54, ease: [0.22, 1, 0.36, 1] },
  },
};

export function IntelligenceSection() {
  return (
    <section className="relative overflow-hidden bg-card py-24 sm:py-28 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.28 }}
        variants={containerVariants}
        className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div>
          <motion.h2
            variants={itemVariants}
            className="max-w-3xl text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            One coaching view for every signal that matters
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground sm:text-lg"
          >
            Combine coach observations, athlete check-ins, wearable summaries,
            nutrition habits, and historical reports before the next session is
            planned.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="relative min-h-130 overflow-hidden"
        >
          <Image
            src="/maskotlar/gozetleme.png"
            alt="Doctor Panda checking team signals"
            width={1024}
            height={1024}
            className="pointer-events-none hidden sm:visible absolute -right-8 bottom-0 z-10 h-auto w-52 select-none sm:w-64 lg:w-80"
          />

          <div className="relative z-20 grid gap-4 sm:grid-cols-2">
            {signals.map((signal) => (
              <motion.div
                key={signal.label}
                variants={itemVariants}
                className="rounded-3xl border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-700">
                    <Icon icon={signal.icon} className="size-5" />
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">
                    {signal.value}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-foreground">
                  {signal.label}
                </h3>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {signal.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="hidden sm:visible absolute bottom-6 left-0 right-20 z-20 rounded-3xl border border-primary/25 bg-primary-soft p-5 sm:right-auto sm:max-w-sm"
          >
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:lightbulb-bolt-bold"
                className="mt-1 size-5 shrink-0 text-primary-700"
              />
              <p className="text-sm font-bold leading-6 text-primary-foreground">
                Reduce high-intensity work today. Sleep dropped while load rose
                across the same athlete group.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
