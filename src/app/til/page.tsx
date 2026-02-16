import Link from "next/link";
import { getAllTils } from "@/lib/content";
import { MdxContent } from "@/components/mdx-content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "TIL" };

export default async function TilPage() {
  const tils = await getAllTils();

  return (
    <div>
      <h1 className="text-base font-semibold mb-2">today i learned</h1>
      <p className="text-[var(--text-muted)] text-xs mb-8">
        Short things I learn day to day.
      </p>
      <div className="divide-y divide-[var(--border)]">
        {tils.map((til) => (
          <article key={til.meta.slug} id={til.meta.slug} className="py-6">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className="font-semibold text-sm">{til.meta.title}</h2>
              <span className="text-[var(--text-muted)] text-[11px] shrink-0">
                {new Date(til.meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <MdxContent source={til.content} />
            <div className="mt-2 text-[11px]">
              {til.meta.tags.map((tag) => (
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
