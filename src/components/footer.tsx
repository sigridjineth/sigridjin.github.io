import Link from "next/link";
import { getAllTags } from "@/lib/content";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="border-t border-[var(--border)] mt-16 pt-8 pb-16 text-xs text-[var(--text-muted)]">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="text-[var(--text-muted)] hover:text-[var(--text)] !bg-none !no-underline hover:!underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} sigridjin</span>
        <Link href="/feed.xml" className="!bg-none !no-underline hover:!underline">rss</Link>
      </div>
    </footer>
  );
}
