import { getAllTags, getContentByTag } from "@/lib/content";
import { FeedItem } from "@/components/feed-item";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const content = await getContentByTag(tag);

  return (
    <div>
      <h1 className="text-base font-semibold mb-8">#{tag}</h1>
      <div className="divide-y divide-[var(--border)]">
        {content.map((item) => (
          <FeedItem key={`${item.meta.type}-${item.meta.slug}`} item={item} />
        ))}
      </div>
    </div>
  );
}
