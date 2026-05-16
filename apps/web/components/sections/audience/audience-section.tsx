"use client";

import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

type AudienceCard = {
  background: string;
  description: string;
  icon: string;
  title: string;
};

const audienceCards: AudienceCard[] = [
  {
    title: "Coaches & Staff",
    description:
      "Turn session notes, readiness signals, RPE, and past reports into clear coaching decisions.",
    icon: "solar:clipboard-check-bold",
    background: "/arkaplanlar/1861636_Image.png",
  },
  {
    title: "Athletes",
    description:
      "Log daily check-ins, personal training, nutrition habits, and smart watch activity in one place.",
    icon: "solar:running-2-bold",
    background: "/arkaplanlar/1861640_Image.png",
  },
  {
    title: "Clubs & Academies",
    description:
      "Keep team memory, staff collaboration, player development, and self-hosted data ownership together.",
    icon: "solar:buildings-3-bold",
    background: "/arkaplanlar/1861646_Image.png",
  },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AudienceCard({ background, description, icon, title }: AudienceCard) {
  return (
    <motion.article
      variants={cardVariants}
      className="group relative min-h-[430px] overflow-hidden rounded-3xl border border-border bg-card md:min-h-[480px]"
    >
      <Image
        src={background}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-white/95 via-white/78 to-white/10" />

      <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
        <div className="flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary-soft text-primary-700">
          <Icon icon={icon} className="size-5" />
        </div>

        <div className="mt-5 max-w-[18rem]">
          <h3 className="text-2xl font-extrabold leading-tight text-foreground">
            {title}
          </h3>
          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-auto inline-flex items-center gap-2 text-sm font-extrabold text-primary-700">
          <span>Explore workflow</span>
          <Icon
            icon="solar:arrow-right-linear"
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.article>
  );
}

export function AudienceSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-28 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.24 }}
        variants={sectionVariants}
        className="mx-auto w-full max-w-7xl px-5 md:px-8"
      >
        <div className="relative ml-auto max-w-3xl text-center lg:text-right">
          <Image
            src="/maskotlar/utanma.png"
            alt="Doctor Panda"
            width={1024}
            height={1024}
            className="pointer-events-none absolute -top-20 right-8 z-0 h-auto w-28 select-none sm:-top-24 sm:right-14 sm:w-36 lg:-top-28 lg:right-24 lg:w-40"
          />
          <div className="relative z-10">
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Built for every role around the team
            </h2>
            <p className="ml-auto mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground sm:text-lg">
              OhHike CoachOS connects the people who create training data, read
              the signals, and turn team memory into better decisions.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-16 lg:gap-8">
          {audienceCards.map((card) => (
            <AudienceCard key={card.title} {...card} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
