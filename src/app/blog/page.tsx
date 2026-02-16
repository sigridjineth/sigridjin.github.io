import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <h1 className="text-base font-semibold mb-8">blog</h1>
      <div className="divide-y divide-[var(--border)]">
        {posts.map((post) => (
          <article key={post.meta.slug} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <Link
                href={`/blog/${post.meta.slug}`}
                className="font-semibold text-sm !bg-none !no-underline hover:!underline"
              >
                {post.meta.title}
              </Link>
              <span className="text-[var(--text-muted)] text-[11px] shrink-0">
                {new Date(post.meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {post.meta.summary && (
              <p className="text-[var(--text-muted)] mt-1 text-xs">{post.meta.summary}</p>
            )}
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              {post.meta.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="mr-2 !bg-none !no-underline hover:!underline"
                >
                  #{tag}
                </Link>
              ))}
              <span>{post.meta.readingTime}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
