import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getAllPosts } from "@/lib/content";
import { MdxContent } from "@/components/mdx-content";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-base font-semibold mb-2">{post.meta.title}</h1>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
          <time>
            {new Date(post.meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>{post.meta.readingTime}</span>
          <span>
            {post.meta.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="mr-2 !bg-none !no-underline hover:!underline"
              >
                #{tag}
              </Link>
            ))}
          </span>
        </div>
      </header>
      <MdxContent source={post.content} />
    </article>
  );
}
