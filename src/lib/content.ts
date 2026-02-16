import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const contentDir = path.join(process.cwd(), "content");

export type ContentType = "posts" | "tils" | "links";

export interface PostMeta {
  type: "post";
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft?: boolean;
  readingTime: string;
}

export interface TilMeta {
  type: "til";
  slug: string;
  title: string;
  date: string;
  tags: string[];
}

export interface LinkMeta {
  type: "link";
  slug: string;
  title: string;
  url: string;
  date: string;
  tags: string[];
  via?: string;
}

export type ContentMeta = PostMeta | TilMeta | LinkMeta;

export interface ContentItem<T extends ContentMeta = ContentMeta> {
  meta: T;
  content: string;
}

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

export async function getPost(slug: string): Promise<ContentItem<PostMeta> | null> {
  const filePath = path.join(contentDir, "posts", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: {
      type: "post",
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      summary: data.summary || "",
      draft: data.draft || false,
      readingTime: readingTime(content).text,
    },
    content,
  };
}

export async function getTil(slug: string): Promise<ContentItem<TilMeta> | null> {
  const filePath = path.join(contentDir, "tils", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: { type: "til", slug, title: data.title, date: data.date, tags: data.tags || [] },
    content,
  };
}

export async function getLink(slug: string): Promise<ContentItem<LinkMeta> | null> {
  const filePath = path.join(contentDir, "links", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: {
      type: "link",
      slug,
      title: data.title,
      url: data.url,
      date: data.date,
      tags: data.tags || [],
      via: data.via,
    },
    content,
  };
}

export async function getAllPosts(): Promise<ContentItem<PostMeta>[]> {
  const files = getMdxFiles(path.join(contentDir, "posts"));
  const posts = await Promise.all(
    files.map((f) => getPost(f.replace(".mdx", "")))
  );
  return posts
    .filter((p): p is ContentItem<PostMeta> => p !== null && !p.meta.draft)
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export async function getAllTils(): Promise<ContentItem<TilMeta>[]> {
  const files = getMdxFiles(path.join(contentDir, "tils"));
  const tils = await Promise.all(
    files.map((f) => getTil(f.replace(".mdx", "")))
  );
  return tils
    .filter((t): t is ContentItem<TilMeta> => t !== null)
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export async function getAllLinks(): Promise<ContentItem<LinkMeta>[]> {
  const files = getMdxFiles(path.join(contentDir, "links"));
  const links = await Promise.all(
    files.map((f) => getLink(f.replace(".mdx", "")))
  );
  return links
    .filter((l): l is ContentItem<LinkMeta> => l !== null)
    .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export async function getAllContent(): Promise<ContentItem[]> {
  const [posts, tils, links] = await Promise.all([
    getAllPosts(),
    getAllTils(),
    getAllLinks(),
  ]);
  return [...posts, ...tils, ...links].sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
}

export async function getAllTags(): Promise<string[]> {
  const content = await getAllContent();
  const tagSet = new Set<string>();
  content.forEach((item) => item.meta.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export async function getContentByTag(tag: string): Promise<ContentItem[]> {
  const content = await getAllContent();
  return content.filter((item) => item.meta.tags.includes(tag));
}
