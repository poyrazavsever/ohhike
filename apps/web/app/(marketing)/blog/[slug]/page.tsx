// @ts-nocheck
import { notFound } from "next/navigation";
import Image from "next/image";

import { blogPosts } from "../../../../lib/mock-blog";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-background">
      <article className="mx-auto w-full max-w-5xl px-5 py-24 md:px-8 lg:py-28">
        <header className="mx-auto max-w-4xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
            <span>{post.date}</span>
            <span className="size-1 rounded-full bg-primary" />
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.08] text-foreground sm:text-6xl">
            {post.title}
          </h1>
        </header>

        <div className="relative mt-12 min-h-[360px] overflow-hidden rounded-[2rem] border border-border bg-card sm:min-h-[520px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-6 text-base font-medium leading-8 text-muted-foreground sm:text-lg">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}

