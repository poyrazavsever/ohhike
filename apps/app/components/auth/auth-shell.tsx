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
    title: "Welcome back to CoachOS",
    description:
      "Continue building your team memory with check-ins, smart watch data, session notes, and AI reports.",
  },
  register: {
    title: "Create your coaching workspace",
    description:
      "Start with your first team, invite athletes, and turn every session into useful team intelligence.",
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
        <div
          className={
            visualFirst
              ? "relative hidden lg:order-1 lg:block lg:min-h-svh"
              : "relative hidden lg:order-2 lg:block lg:min-h-svh"
          }
        >
          <Image
            src="/arkaplanlar/1861636_Image.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/35 via-white/10 to-primary-soft/55" />
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
        </div>

        <div
          className={
            visualFirst
              ? "flex min-h-svh items-center justify-center bg-background p-6 sm:p-10 lg:order-2"
              : "flex min-h-svh items-center justify-center bg-background p-6 sm:p-10 lg:order-1"
          }
        >
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
