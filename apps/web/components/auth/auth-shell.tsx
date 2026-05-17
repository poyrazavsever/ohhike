"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
};

const copy = {
  login: {
    title: "Welcome back",
    description:
      "Sign in to manage your coach applications, messages, and remote training profile.",
  },
  register: {
    title: "Join the coach network",
    description:
      "Create an athlete account to find coaches, apply for remote coaching, and track your journey.",
  },
};

export function AuthShell({ children, mode }: AuthShellProps) {
  const visualFirst = mode === "login";
  const content = copy[mode];

  return (
    <main className="min-h-svh w-full bg-background">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
        className="grid min-h-svh w-full bg-card lg:grid-cols-2"
      >
        <motion.div
          className={
            visualFirst
              ? "relative hidden lg:order-1 lg:block lg:min-h-svh"
              : "relative hidden lg:order-2 lg:block lg:min-h-svh"
          }
        >
          <motion.div className="absolute inset-0 bg-linear-to-br from-primary-soft via-background to-primary/15" />
          <Image
            src="/logo/logoWtextBlack.png"
            alt="OH HIKE"
            width={220}
            height={62}
            priority
            className="absolute left-6 top-6 z-10 h-10 w-auto object-contain sm:left-10 sm:top-10"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <h1 className="max-w-md text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-muted-foreground sm:text-base">
              {content.description}
            </p>
          </div>
        </motion.div>

        <div
          className={
            visualFirst
              ? "flex min-h-svh items-center justify-center bg-background p-6 sm:p-10 lg:order-2"
              : "flex min-h-svh items-center justify-center bg-background p-6 sm:p-10 lg:order-1"
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
