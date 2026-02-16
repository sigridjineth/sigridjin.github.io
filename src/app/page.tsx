import { getAllContent } from "@/lib/content";
import { FeedItem } from "@/components/feed-item";

export default async function HomePage() {
  const content = await getAllContent();

  return (
    <div>
      <section className="mb-8">
        <p className="text-[var(--text-muted)] text-xs">
          Software engineer. Writing about code, ML, and things I learn.
        </p>
      </section>
      <div className="divide-y divide-[var(--border)]">
        {content.map((item) => (
          <FeedItem key={`${item.meta.type}-${item.meta.slug}`} item={item} />
        ))}
      </div>
      {content.length === 0 && (
        <p className="text-[var(--text-muted)] text-xs py-8">No posts yet.</p>
      )}
    </div>
  );
}
