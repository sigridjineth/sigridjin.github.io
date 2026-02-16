import Link from "next/link";
import { getAllLinks } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Links" };

export default async function LinksPage() {
  const links = await getAllLinks();

  return (
    <div>
      <h1 className="text-base font-semibold mb-2">links</h1>
      <p className="text-[var(--text-muted)] text-xs mb-8">
        Interesting things I find around the web.
      </p>
      <div className="divide-y divide-[var(--border)]">
        {links.map((link) => (
          <article key={link.meta.slug} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <a
                href={link.meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm !bg-none !no-underline hover:!underline"
              >
                {link.meta.title} &rarr;
              </a>
              <span className="text-[var(--text-muted)] text-[11px] shrink-0">
                {new Date(link.meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {link.meta.via && (
              <span className="text-[var(--text-muted)] text-[11px]">via {link.meta.via}</span>
            )}
            <p className="text-[var(--text-muted)] mt-1 text-xs">{link.content}</p>
            <div className="mt-1 text-[11px]">
              {link.meta.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="mr-2 text-[var(--text-muted)] !bg-none !no-underline hover:!underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
