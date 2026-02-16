import Link from "next/link";
import type { ContentItem, PostMeta, TilMeta, LinkMeta } from "@/lib/content";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <span className="text-[var(--text-muted)]">
      {tags.map((tag, i) => (
        <span key={tag}>
          <Link href={`/tags/${tag}`} className="!bg-none !no-underline hover:!underline">
            #{tag}
          </Link>
          {i < tags.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

function PostItem({ meta }: { meta: PostMeta }) {
  return (
    <article className="py-4">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">post</span>
        <span className="text-[var(--text-muted)] text-[11px]">{formatDate(meta.date)}</span>
      </div>
      <Link href={`/blog/${meta.slug}`} className="font-semibold text-sm !bg-none !no-underline hover:!underline">
        {meta.title}
      </Link>
      {meta.summary && (
        <p className="text-[var(--text-muted)] mt-1 text-xs">{meta.summary}</p>
      )}
      <div className="mt-1 text-[11px]">
        <Tags tags={meta.tags} />
        <span className="text-[var(--text-muted)] ml-2">{meta.readingTime}</span>
      </div>
    </article>
  );
}

function TilItem({ meta, content }: { meta: TilMeta; content: string }) {
  const preview = content.slice(0, 200).trim();
  return (
    <article className="py-4">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">til</span>
        <span className="text-[var(--text-muted)] text-[11px]">{formatDate(meta.date)}</span>
      </div>
      <Link href={`/til#${meta.slug}`} className="font-semibold text-sm !bg-none !no-underline hover:!underline">
        {meta.title}
      </Link>
      <p className="text-[var(--text-muted)] mt-1 text-xs">{preview}{content.length > 200 ? "..." : ""}</p>
      <div className="mt-1 text-[11px]">
        <Tags tags={meta.tags} />
      </div>
    </article>
  );
}

function LinkItem({ meta, content }: { meta: LinkMeta; content: string }) {
  const preview = content.slice(0, 200).trim();
  return (
    <article className="py-4">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">link</span>
        <span className="text-[var(--text-muted)] text-[11px]">{formatDate(meta.date)}</span>
      </div>
      <a
        href={meta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-sm !bg-none !no-underline hover:!underline"
      >
        {meta.title} &rarr;
      </a>
      {meta.via && (
        <span className="text-[var(--text-muted)] text-[11px] ml-2">via {meta.via}</span>
      )}
      <p className="text-[var(--text-muted)] mt-1 text-xs">{preview}{content.length > 200 ? "..." : ""}</p>
      <div className="mt-1 text-[11px]">
        <Tags tags={meta.tags} />
      </div>
    </article>
  );
}

export function FeedItem({ item }: { item: ContentItem }) {
  switch (item.meta.type) {
    case "post":
      return <PostItem meta={item.meta} />;
    case "til":
      return <TilItem meta={item.meta} content={item.content} />;
    case "link":
      return <LinkItem meta={item.meta} content={item.content} />;
  }
}
