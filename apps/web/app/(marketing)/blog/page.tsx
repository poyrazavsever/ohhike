// @ts-nocheck
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

import { blogPosts } from "../../../lib/mock-blog";

export default function BlogPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 py-24 md:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary-700">
            <Icon icon="solar:pen-new-square-bold" className="size-3.5" />
            <span>community blog</span>
          </div>
          <h1 className="mt-7 text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl">
            Notes on training, recovery, and team intelligence
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
            Short community posts about better routines for coaches and
            athletes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[2rem] border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="relative min-h-[260px] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="size-1 rounded-full bg-primary" />
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight text-foreground">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary-700">
                  Read post
                  <Icon
                    icon="solar:arrow-right-linear"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

