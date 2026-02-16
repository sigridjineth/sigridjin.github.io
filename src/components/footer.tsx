import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 pt-8 pb-16 text-xs text-[var(--text-muted)]">
      <div className="flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} sigridjin</span>
        <Link href="/feed.xml" className="!bg-none !no-underline hover:!underline">rss</Link>
      </div>
    </footer>
  );
}
