"use client";

import { Icon } from "@iconify/react";
import { IconSlideButton } from "@repo/ui/components/ui/button";
import { PricingCard, PricingFeature, PricingFeatureList } from "@repo/ui/components/ui/pricing-card";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { getAppUrl } from "../../../lib/site-url";

type Plan = {
  cta: string;
  description: string;
  featured?: boolean;
  features: string[];
  href: string;
  meta: string;
  name: string;
  notIncluded?: string[];
  price: string;
};

const plans: Plan[] = [
  {
    name: "Basic Team",
    meta: "3 team members",
    price: "Free",
    description:
      "Start collecting team data without AI. Best for trying the core workflow with a small staff.",
    cta: "Start Basic",
    href: getAppUrl("/register?plan=basic_team"),
    features: [
      "Team and athlete management",
      "Session and calendar workflow",
      "Daily check-ins",
      "Nutrition and water habits",
      "Manual data entry",
    ],
    notIncluded: [
      "AI Coach Reports",
      "Team Memory",
      "AI Training Planner",
      "PDF export",
    ],
  },
  {
    name: "Pro Team",
    meta: "20+ team members",
    price: "$29/mo",
    description:
      "Unlock AI analysis for an active team that needs reports, memory, planning, and wearable summaries.",
    cta: "Upgrade Team",
    href: getAppUrl("/register?plan=pro_team"),
    featured: true,
    features: [
      "Everything in Basic",
      "AI Coach Reports",
      "Team Memory / RAG Assistant",
      "Data and report analysis",
      "Readiness and load insights",
      "Training planner",
      "PDF export",
      "Wearable data summaries",
    ],
  },
  {
    name: "Pro Plus Team",
    meta: "50+ team members",
    price: "$59/mo",
    description:
      "For larger teams and academies that need advanced collaboration, reporting, and data ownership controls.",
    cta: "Choose Pro Plus",
    href: getAppUrl("/register?plan=pro_plus_team"),
    features: [
      "Everything in Pro",
      "Advanced Team Memory",
      "Higher AI report limits",
      "Multi-staff collaboration",
      "Advanced roles and visibility",
      "Branded reports",
      "Priority support",
      "Advanced audit and data controls",
    ],
  },
];

const comparisonRows = [
  {
    feature: "Team members",
    basic: "3",
    pro: "20+",
    proPlus: "50+",
  },
  {
    feature: "Team and athlete management",
    basic: true,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Session and calendar workflow",
    basic: true,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Daily check-ins",
    basic: true,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Nutrition and water habits",
    basic: true,
    pro: true,
    proPlus: true,
  },
  {
    feature: "AI Coach Reports",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Team Memory / RAG Assistant",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Data and report analysis",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Readiness and load insights",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "AI Training Planner",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Wearable summaries",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "PDF export",
    basic: false,
    pro: true,
    proPlus: true,
  },
  {
    feature: "Branded reports",
    basic: false,
    pro: false,
    proPlus: true,
  },
  {
    feature: "Advanced roles and visibility",
    basic: false,
    pro: false,
    proPlus: true,
  },
  {
    feature: "Priority support",
    basic: false,
    pro: false,
    proPlus: true,
  },
  {
    feature: "Advanced audit and data controls",
    basic: false,
    pro: false,
    proPlus: true,
  },
];

const revealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div variants={revealItem} className="h-full">
      <PricingCard
        name={plan.name}
        meta={plan.meta}
        price={plan.price}
        description={plan.description}
        featured={plan.featured}
        cta={
          <IconSlideButton
            as={Link}
            href={plan.href}
            variant={plan.featured ? "default" : "outline"}
            className="w-full"
            text={plan.cta}
            icon={<Icon icon="solar:arrow-right-linear" />}
          />
        }
      >
        <PricingFeatureList>
          {plan.features.map((feature) => (
            <PricingFeature key={feature}>{feature}</PricingFeature>
          ))}
          {plan.notIncluded?.map((feature) => (
            <PricingFeature key={feature} muted>
              No {feature}
            </PricingFeature>
          ))}
        </PricingFeatureList>
      </PricingCard>
    </motion.div>
  );
}

function ComparisonValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-extrabold text-foreground">{value}</span>;
  }

  return value ? (
    <Icon icon="solar:check-circle-bold" className="mx-auto size-5 text-primary" />
  ) : (
    <Icon
      icon="solar:close-circle-bold"
      className="mx-auto size-5 text-muted-foreground/55"
    />
  );
}

export default function PricingPage() {
  return (
    <main className="bg-background">
      <section className="relative overflow-hidden px-5 py-24 md:px-8 lg:py-28">
        <Image
          src="/arkaplanlar/1861641_Image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/92 via-background/86 to-background" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={revealContainer}
          className="relative z-10 mx-auto max-w-7xl"
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              variants={revealItem}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700"
            >
              <Icon icon="solar:users-group-rounded-bold" className="size-3.5" />
              <span>team-based billing</span>
            </motion.div>

            <motion.h1
              variants={revealItem}
              className="mt-7 text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl"
            >
              Upgrade teams, not individual users
            </motion.h1>

            <motion.p
              variants={revealItem}
              className="mx-auto mt-6 max-w-3xl text-base font-medium leading-8 text-muted-foreground sm:text-lg"
            >
              OhHike CoachOS pricing follows the team. Basic teams can collect
              core training data, while Pro and Pro Plus teams unlock AI
              reports, Team Memory, planning, exports, and larger collaboration.
            </motion.p>
          </div>

          <motion.div
            variants={revealContainer}
            className="mt-14 overflow-x-auto pb-2"
          >
            <div className="grid min-w-[980px] auto-rows-fr grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={revealItem}
            className="mt-10"
          >
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-extrabold text-foreground">
                Compare team plans
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
                Basic keeps the core workflow simple. Pro opens the AI layer.
                Pro Plus adds larger-team controls and branded operations.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-border bg-card">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-sm font-extrabold text-foreground">
                      Feature
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-extrabold text-foreground">
                      Basic Team
                    </th>
                    <th className="bg-primary-soft/60 px-5 py-4 text-center text-sm font-extrabold text-foreground">
                      Pro Team
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-extrabold text-foreground">
                      Pro Plus Team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">
                        {row.feature}
                      </td>
                      <td className="px-5 py-4 text-center text-sm">
                        <ComparisonValue value={row.basic} />
                      </td>
                      <td className="bg-primary-soft/35 px-5 py-4 text-center text-sm">
                        <ComparisonValue value={row.pro} />
                      </td>
                      <td className="px-5 py-4 text-center text-sm">
                        <ComparisonValue value={row.proPlus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
