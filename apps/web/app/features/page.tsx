"use client";

import { Icon } from "@iconify/react";
import {
  FeatureItem,
  FeaturePill,
  FeatureSectionHeader,
  FeatureSectionShell,
} from "@repo/ui/components/ui/feature-block";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

type Feature = {
  description: string;
  icon: string;
  title: string;
};

type FeatureSection = {
  accent: "primary" | "secondary";
  description: string;
  features: Feature[];
  mascot: string;
  mascotAlt: string;
  title: string;
};

const revealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const featureSections: FeatureSection[] = [
  {
    title: "Build the structure before the season gets noisy",
    description:
      "OhHike keeps organizations, teams, staff roles, and player records in one clean operating layer.",
    mascot: "/maskotlar/elleIsaretEtme.png",
    mascotAlt: "Doctor Panda pointing",
    accent: "primary",
    features: [
      {
        title: "Organization & Club Management",
        description:
          "Create clubs, academies, school teams, or individual coach workspaces with staff invites, plans, audit logs, and self-host settings.",
        icon: "solar:buildings-3-bold",
      },
      {
        title: "Team Management",
        description:
          "Manage sport type, age group, level, weekly training rhythm, season goals, staff assignments, and team memory.",
        icon: "solar:users-group-rounded-bold",
      },
      {
        title: "Athlete / Player Management",
        description:
          "Add athletes manually or by CSV, send claim invites, track profile details, statuses, notes, and AI player summaries.",
        icon: "solar:user-id-bold",
      },
      {
        title: "Roles & Permissions",
        description:
          "Owner, admin, coach, analyst, physiotherapist, nutritionist, athlete, and viewer permissions stay clearly separated.",
        icon: "solar:lock-keyhole-bold",
      },
    ],
  },
  {
    title: "Give coaches and athletes the right screen every day",
    description:
      "Dashboards collect the daily signals teams usually lose across messages, notebooks, and spreadsheets.",
    mascot: "/maskotlar/suIcme.png",
    mascotAlt: "Doctor Panda drinking water",
    accent: "secondary",
    features: [
      {
        title: "Coach Dashboard",
        description:
          "See readiness, training load, athlete risk alerts, missing check-ins, wearable sync, AI insights, and upcoming sessions.",
        icon: "solar:chart-2-bold",
      },
      {
        title: "Athlete Dashboard",
        description:
          "Athletes complete check-ins, view tasks, log personal work, enter RPE, track nutrition, and follow their own progress.",
        icon: "solar:smartphone-bold",
      },
      {
        title: "Readiness & Wellness Check-in",
        description:
          "Sleep, energy, soreness, pain, stress, motivation, illness signals, and notes become a practical readiness score.",
        icon: "solar:pulse-2-bold",
      },
      {
        title: "Diet & Nutrition Tracking",
        description:
          "Track water, meals, training-day habits, protein goal alignment, athlete notes, and nutritionist feedback.",
        icon: "solar:cup-hot-bold",
      },
    ],
  },
  {
    title: "Plan, run, and review every kind of session",
    description:
      "Team training, personal work, recovery, match days, tests, and review meetings share the same operational rhythm.",
    mascot: "/maskotlar/kosu.png",
    mascotAlt: "Doctor Panda running",
    accent: "primary",
    features: [
      {
        title: "Session & Calendar Management",
        description:
          "Create sessions with goals, planned intensity, blocks, attendance, RPE, coach notes, and AI report generation.",
        icon: "solar:calendar-mark-bold",
      },
      {
        title: "Group Training Tracking",
        description:
          "Capture attendance, training blocks, planned versus actual duration, athlete minutes, RPE, and post-session notes.",
        icon: "solar:users-group-two-rounded-bold",
      },
      {
        title: "Personal Training Tracking",
        description:
          "Athletes log running, gym, technical, mobility, recovery, or match work and optionally match it with smart watch activity.",
        icon: "solar:running-2-bold",
      },
      {
        title: "Drill Library & Training Planner",
        description:
          "Store drills by sport, goal, duration, player count, equipment, coaching points, and generate plans from team context.",
        icon: "solar:clipboard-list-bold",
      },
      {
        title: "Performance Goals",
        description:
          "Define team goals like transition defense and player goals like sleep, mobility, nutrition, or pain reporting consistency.",
        icon: "solar:target-bold",
      },
    ],
  },
  {
    title: "Use smart watch data without making it mandatory",
    description:
      "Wearables strengthen the system, but manual inputs keep every athlete included even without a device.",
    mascot: "/maskotlar/gozetleme.png",
    mascotAlt: "Doctor Panda observing",
    accent: "secondary",
    features: [
      {
        title: "Wearable Data Hub",
        description:
          "Connect supported smart watch sources and normalize activity, heart rate, sleep, HRV, stress, calories, and daily summaries.",
        icon: "solar:watch-round-bold",
      },
      {
        title: "Load & Recovery Management",
        description:
          "Relate session attendance, RPE, personal training, wearable activity, sleep, soreness, and recovery notes.",
        icon: "solar:shield-warning-bold",
      },
      {
        title: "Data & Report Analysis",
        description:
          "Analyze coach notes, check-ins, smart watch summaries, personal training, nutrition habits, and historical reports.",
        icon: "solar:database-bold",
      },
    ],
  },
  {
    title: "Turn raw team data into decisions coaches can use",
    description:
      "AI outputs stay structured, reviewable, and tied to the actual team context instead of generic advice.",
    mascot: "/maskotlar/harita.png",
    mascotAlt: "Doctor Panda holding a map",
    accent: "primary",
    features: [
      {
        title: "AI Coach Reports",
        description:
          "Generate session reports with summary, goal alignment, player observations, load impact, readiness context, risks, and next-session suggestions.",
        icon: "solar:document-add-bold",
      },
      {
        title: "Team Memory / RAG Assistant",
        description:
          "Keep reports, coach notes, observations, readiness trends, wearable summaries, nutrition signals, drills, goals, and staff comments searchable.",
        icon: "solar:stars-bold",
      },
      {
        title: "Coach Questions",
        description:
          "Ask what repeated most this month, who carried high load this week, or how tomorrow should change based on fatigue.",
        icon: "solar:question-circle-bold",
      },
    ],
  },
  {
    title: "Share the work, keep control of the data",
    description:
      "Reports, exports, collaboration, privacy, and self-hosting make OhHike useful for both small teams and serious clubs.",
    mascot: "/maskotlar/basardin.png",
    mascotAlt: "Doctor Panda celebrating success",
    accent: "secondary",
    features: [
      {
        title: "Reports & Exports",
        description:
          "Create session, match, training, player development, weekly team, load, nutrition, readiness, and scout reports.",
        icon: "solar:file-download-bold",
      },
      {
        title: "PDF and Shareable Reports",
        description:
          "Export branded PDFs, share links, and control report visibility by role, player, or parent-facing needs.",
        icon: "solar:export-bold",
      },
      {
        title: "Staff Collaboration",
        description:
          "Let coaches, analysts, physiotherapists, nutritionists, admins, and viewers contribute inside their permission boundaries.",
        icon: "solar:chat-round-like-bold",
      },
      {
        title: "Self-host and API Key Management",
        description:
          "Run the open-source core on your own infrastructure with your database, storage, AI keys, wearable provider keys, backup, and telemetry settings.",
        icon: "solar:server-square-cloud-bold",
      },
    ],
  },
];

function FeatureIcon({ icon }: { icon: string }) {
  return <Icon icon={icon} className="size-5" />;
}

function FeaturesHero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-background">
      <Image
        src="/arkaplanlar/1861722_Image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={revealContainer}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center md:px-8"
      >
        <motion.div variants={revealItem}>
          <FeaturePill>CoachOS features</FeaturePill>
        </motion.div>

        <motion.h1
          variants={revealItem}
          className="mt-7 max-w-5xl text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl"
        >
          Everything your team learns, in one operating system
        </motion.h1>

        <motion.p
          variants={revealItem}
          className="mt-6 max-w-3xl text-balance text-base font-medium leading-8 text-muted-foreground sm:text-lg"
        >
          OhHike CoachOS brings club operations, athlete data, training
          workflows, wearable summaries, AI reports, and team memory into a
          single open-source coaching platform.
        </motion.p>

        <motion.div
          variants={revealItem}
          className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {["Open source", "Self-host", "Coach reports", "Team memory"].map(
            (item) => (
              <div
                key={item}
                className="rounded-full border border-border bg-card/80 px-4 py-3 text-sm font-extrabold text-foreground"
              >
                {item}
              </div>
            ),
          )}
        </motion.div>

        <motion.div
          variants={revealItem}
          className="pointer-events-none absolute bottom-0 right-3 h-auto w-36 select-none sm:right-10 sm:w-48 lg:w-60"
        >
          <Image
            src="/maskotlar/hazirlik.png"
            alt="Doctor Panda getting ready"
            width={1024}
            height={1024}
            className="h-auto w-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureSectionBlock({
  accent,
  description,
  features,
  mascot,
  mascotAlt,
  title,
}: FeatureSection) {
  return (
    <FeatureSectionShell className={accent === "secondary" ? "bg-secondary-soft/45" : ""}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={revealContainer}
        className="relative grid min-h-140 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]"
      >
        <motion.div variants={revealItem} className="relative z-10">
          <FeatureSectionHeader
            title={title}
            description={description}
          />
          <Image
            src={mascot}
            alt={mascotAlt}
            width={1024}
            height={1024}
            className="pointer-events-none absolute -bottom-40 -left-8 z-0 hidden h-auto w-56 select-none lg:block xl:-bottom-72 xl:-left-10 xl:w-64"
          />
        </motion.div>

        <motion.div
          variants={revealContainer}
          className="relative z-10 grid auto-rows-fr gap-4 sm:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={revealItem} className="h-full">
              <FeatureItem
                title={feature.title}
                icon={<FeatureIcon icon={feature.icon} />}
              >
                {feature.description}
              </FeatureItem>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </FeatureSectionShell>
  );
}

export default function FeaturesPage() {
  return (
    <main>
      <FeaturesHero />
      {featureSections.map((section) => (
        <FeatureSectionBlock key={section.title} {...section} />
      ))}
    </main>
  );
}
