"use client";

import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function AboutPage() {
  return (
    <main>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
        <Image
          src="/arkaplanlar/1861670_Image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/85 via-background/70 to-primary-soft/45" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700"
          >
            <Icon icon="solar:heart-bold" className="size-3.5" />
            <span>built at ODTU Teknokent Hackathon</span>
          </motion.div>

          <motion.h1
            custom={0.12}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            className="mt-7 max-w-4xl text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl"
          >
            OhHike started as a small idea with a lot of heart
          </motion.h1>

          <motion.p
            custom={0.26}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            className="mt-7 max-w-3xl text-balance text-base font-medium leading-8 text-muted-foreground sm:text-lg"
          >
            OhHike CoachOS was developed by Poyraz Avsever during the ODTU
            Teknokent Hackathon as a focused attempt to help coaches make better
            decisions from training notes, athlete check-ins, smart watch data,
            and team reports.
          </motion.p>

          <motion.p
            custom={0.4}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            className="mt-4 max-w-3xl text-balance text-base font-medium leading-8 text-muted-foreground sm:text-lg"
          >
            The mascot came from a simple personal detail: Poyraz loves pandas
            and turquoise. Doctor Panda and the soft turquoise identity grew
            from that mix, giving the product a friendly face while keeping the
            platform useful for serious team operations.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
