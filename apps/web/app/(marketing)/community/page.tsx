"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const event = {
  title: "Recovery Yoga for Teams",
  date: "June 12, 2026",
  time: "19:00 GMT+3",
  location: "Online community session",
  image: "/mock/yoga.jpg",
  description:
    "A calm mobility and recovery session designed for coaches and athletes who want to build better post-training routines.",
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CommunityPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRegistered(true);
  }

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 py-24 md:px-8 lg:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl">
            Community sessions for better team habits
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
            Join mock community events, learn with coaches, and build healthier
            team routines around recovery, check-ins, and smart training.
          </p>
        </motion.div>

        <motion.button
          type="button"
          initial="hidden"
          animate="visible"
          variants={reveal}
          onClick={() => {
            setIsOpen(true);
            setIsRegistered(false);
          }}
          className="group mx-auto mt-14 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card text-left transition-colors hover:border-primary/40 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="relative min-h-[320px] overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
              <Icon icon="solar:calendar-mark-bold" className="size-3.5" />
              <span>{event.date}</span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-foreground">
              {event.title}
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-muted-foreground">
              {event.description}
            </p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-foreground sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <Icon icon="solar:clock-circle-bold" className="size-4 text-primary" />
                {event.time}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon icon="solar:monitor-smartphone-bold" className="size-4 text-primary" />
                {event.location}
              </span>
            </div>
            <div className="mt-auto pt-8 text-sm font-extrabold text-primary-700">
              Open registration
            </div>
          </div>
        </motion.button>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-foreground/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground">
                  Register for {event.title}
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  Mock registration form. No data is sent.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close registration modal"
              >
                <Icon icon="solar:close-circle-bold" className="size-7" />
              </button>
            </div>

            {isRegistered ? (
              <div className="mt-8 rounded-3xl border border-primary/35 bg-primary-soft p-5">
                <div className="flex items-center gap-3 text-primary-700">
                  <Icon icon="solar:check-circle-bold" className="size-6" />
                  <p className="font-extrabold">
                    Registration received. See you at the session.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submitRegistration} className="mt-8 grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-foreground">
                  Name
                  <input
                    required
                    className="h-12 rounded-2xl border border-input bg-background px-4 font-medium outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-foreground">
                  Email
                  <input
                    required
                    type="email"
                    className="h-12 rounded-2xl border border-input bg-background px-4 font-medium outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </label>
                <Button type="submit" size="lg" className="mt-4 rounded-full gap-2">
                  Register
                  <Icon icon="solar:arrow-right-linear" className="size-5" />
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
