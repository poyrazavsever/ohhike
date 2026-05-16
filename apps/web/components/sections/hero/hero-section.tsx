"use client";

import { Icon } from "@iconify/react";
import { IconSlideButton } from "@repo/ui/components/ui/button";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { getAppUrl } from "../../../lib/site-url";

type MascotLayer = {
  alt: string;
  className: string;
  priority?: boolean;
  src: string;
};

const mascotLayers: MascotLayer[] = [
  {
    src: "/maskotlar/uykuu.png",
    alt: "Doctor Panda sleeping",
    className:
      "right-[8%] top-[58%] z-20 w-[132px] sm:right-[13%] sm:w-[172px] lg:right-[9%] lg:top-[60%] lg:w-[210px]",
  },
  {
    src: "/maskotlar/esnemee.png",
    alt: "Doctor Panda stretching",
    className:
      "bottom-0 left-[-18px] z-30 w-[178px] sm:left-[28px] sm:w-[250px] lg:left-[14px] lg:w-[330px]",
    priority: true,
  },
];

const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
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

const mascotVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    scale: 0.92,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay,
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function HeroBadge() {
  return (
    <motion.div
      custom={0}
      initial="hidden"
      animate="visible"
      variants={heroItemVariants}
      className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700"
    >
      <Icon icon="solar:chart-2-bold" className="size-3.5" />
      <span>open-source AI coaching platform</span>
    </motion.div>
  );
}

function HeroContent() {
  return (
    <div className="relative z-40 mx-auto flex max-w-6xl flex-col items-center px-5 pt-20 text-center sm:pt-24 lg:pt-28">
      <HeroBadge />

      <motion.h1
        custom={0.12}
        initial="hidden"
        animate="visible"
        variants={heroItemVariants}
        className="mt-7 max-w-5xl text-balance text-5xl font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-6xl lg:text-7xl"
      >
        Every session becomes{" "}
        <span className="block text-primary">team intelligence</span>
      </motion.h1>

      <motion.p
        custom={0.26}
        initial="hidden"
        animate="visible"
        variants={heroItemVariants}
        className="mt-6 max-w-3xl text-balance text-base leading-7 text-muted-foreground sm:text-lg"
      >
        OhHike CoachOS brings coach notes, athlete check-ins, smart watch data,
        nutrition habits, and past reports into one AI memory for better
        training decisions.
      </motion.p>

      <motion.div
        custom={0.4}
        initial="hidden"
        animate="visible"
        variants={heroItemVariants}
        className="mt-7 flex flex-wrap items-center justify-center gap-4"
      >
        <IconSlideButton
          as={Link}
          href={getAppUrl("/")}
          text="Start Coaching"
          icon={<Icon icon="solar:bolt-bold" />}
        />

        <IconSlideButton
          as="a"
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          variant="outline"
          text="View on GitHub"
          icon={<Icon icon="mdi:github" />}
        />
      </motion.div>
    </div>
  );
}

function HeroMascot({ alt, className, priority, src }: MascotLayer) {
  return (
    <motion.div
      custom={priority ? 0.78 : 0.62}
      initial="hidden"
      animate="visible"
      variants={mascotVariants}
      className={`pointer-events-none absolute ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={1024}
        priority={priority}
        className="h-auto w-full select-none"
      />
    </motion.div>
  );
}

function HeroScene() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[100%] overflow-hidden">
      <Image
        src="/arkaplanlar/1861726_Image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover md:object-bottom"
      />

      {mascotLayers.map((mascot) => (
        <HeroMascot key={mascot.src} {...mascot} />
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
      <HeroContent />
      <HeroScene />
    </section>
  );
}
