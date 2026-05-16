"use client";

import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    title: "Collect",
    text: "Sessions, check-ins, smart watch summaries, nutrition logs, and staff notes land in one timeline.",
    icon: "solar:inbox-archive-bold",
  },
  {
    title: "Understand",
    text: "AI connects fresh signals with older reports, recurring risks, and team objectives.",
    icon: "solar:graph-new-up-bold",
  },
  {
    title: "Remember",
    text: "Team Memory keeps the useful context ready for the next plan, report, or coach question.",
    icon: "solar:database-bold",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MemorySection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-28 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.28 }}
        variants={containerVariants}
        className="mx-auto w-full max-w-7xl px-5 md:px-8"
      >
        <motion.div
          variants={revealVariants}
          className="relative min-h-170 overflow-hidden rounded-4xl border border-border bg-card"
        >
          <Image
            src="/arkaplanlar/1861670_Image.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/92 to-white/40" />
          <Image
            src="/maskotlar/harita.png"
            alt="Doctor Panda holding a map"
            width={640}
            height={640}
            className="pointer-events-none absolute -bottom-4 -left-10 z-0 h-auto w-56 select-none opacity-95 sm:-bottom-14 sm:w-64 lg:-bottom-10 lg:left-6 lg:w-80"
          />

          <div className="relative z-10 grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.86fr_1.14fr] lg:p-12">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
                  Your season stops disappearing into old notes
                </h2>
                <p className="mt-5 max-w-xl text-base font-medium leading-7 text-muted-foreground sm:text-lg">
                  OhHike turns everyday team data into a living memory that
                  coaches can ask, review, and reuse before decisions are made.
                </p>
              </div>
            </div>

            <div className="grid content-center gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={revealVariants}
                  className="flex gap-4 rounded-3xl border border-border bg-white/78 p-5 backdrop-blur-sm"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Icon icon={step.icon} className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-700">
                      Step {index + 1}
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
