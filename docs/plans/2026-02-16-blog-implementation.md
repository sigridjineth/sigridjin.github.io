# Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal blog at sigridjin.github.io combining monospace minimalism (shumer.dev) with rich content organization (simonwillison.net).

**Architecture:** Next.js 15 App Router with MDX content stored as flat files in `content/`. Content is read at build time via `next-mdx-remote` + `gray-matter`. Tailwind CSS handles styling with CSS custom properties for dark/light theming. Three content types (posts, TILs, links) are rendered via shared utilities and type-specific components.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, next-mdx-remote, gray-matter, rehype-pretty-code, Shiki

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Scaffold Next.js with TypeScript + Tailwind**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults. This creates the project skeleton.

**Step 2: Install content dependencies**

Run:
```bash
npm install next-mdx-remote gray-matter rehype-pretty-code shiki reading-time rss
```

**Step 3: Verify dev server starts**

Run: `npm run dev`
Expected: Next.js dev server on http://localhost:3000

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with dependencies"
```

---

### Task 2: Global Styles & Theme System

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Write global CSS with monospace theme and dark/light mode**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #ffffff;
  --text: #111111;
  --text-muted: #666666;
  --border: #e5e5e5;
  --accent: #0070f3;
  --code-bg: #f5f5f5;
}

.dark {
  --bg: #0a0a0a;
  --text: #e5e5e5;
  --text-muted: #888888;
  --border: #222222;
  --accent: #3b82f6;
  --code-bg: #1a1a1a;
}

* {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

html.light {
  color-scheme: light;
}

body {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text);
  background-color: var(--bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--text);
  text-decoration: none;
  background-image: linear-gradient(var(--text-muted), var(--text-muted));
  background-size: 100% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.2s ease;
}

a:hover {
  background-size: 0% 1px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

::selection {
  background: var(--accent);
  color: white;
}
```

**Step 2: Create theme provider component**

Create `src/components/theme-provider.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
      localStorage.removeItem("theme");
    } else {
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Step 3: Create theme toggle component**

Create `src/components/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
  };

  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs"
    >
      {theme === "dark" ? "[dark]" : theme === "light" ? "[light]" : "[auto]"}
    </button>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add global monospace styles and dark/light theme system"
```

---

### Task 3: Layout Components (Header + Footer)

**Files:**
- Create: `src/components/header.tsx`
- Create: `src/components/footer.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create header component**

Create `src/components/header.tsx`:

```tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/blog", label: "blog" },
  { href: "/til", label: "til" },
  { href: "/links", label: "links" },
  { href: "/about", label: "about" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between py-8">
      <Link href="/" className="text-base font-semibold !bg-none !no-underline hover:!underline">
        sigridjin
      </Link>
      <nav className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors !bg-none !no-underline hover:!underline text-xs"
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

**Step 2: Create footer component**

Create `src/components/footer.tsx`:

```tsx
import Link from "next/link";
import { getAllTags } from "@/lib/content";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="border-t border-[var(--border)] mt-16 pt-8 pb-16 text-xs text-[var(--text-muted)]">
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
      <div className="flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} sigridjin</span>
        <Link href="/feed.xml" className="!bg-none !no-underline hover:!underline">rss</Link>
      </div>
    </footer>
  );
}
```

**Step 3: Wire up root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "sigridjin",
    template: "%s | sigridjin",
  },
  description: "Personal blog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="max-w-[720px] mx-auto px-6">
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add header, footer, and root layout"
```

---

### Task 4: Content Library (MDX Reader + Types)

**Files:**
- Create: `src/lib/content.ts`
- Create: `content/posts/.gitkeep`
- Create: `content/tils/.gitkeep`
- Create: `content/links/.gitkeep`

**Step 1: Create content utility library**

Create `src/lib/content.ts`:

```ts
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
```

**Step 2: Create content directories**

```bash
mkdir -p content/posts content/tils content/links
touch content/posts/.gitkeep content/tils/.gitkeep content/links/.gitkeep
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add content library for reading MDX files"
```

---

### Task 5: MDX Renderer Component

**Files:**
- Create: `src/components/mdx-content.tsx`

**Step 1: Create MDX renderer**

Create `src/components/mdx-content.tsx`:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-base font-semibold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-sm font-semibold mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xs font-semibold mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-[var(--border)] pl-4 text-[var(--text-muted)] mb-4 italic"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-[var(--code-bg)] px-1.5 py-0.5 rounded text-xs" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[var(--code-bg)] p-4 rounded overflow-x-auto mb-4 text-xs leading-relaxed"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  hr: () => <hr className="border-[var(--border)] my-8" />,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="max-w-full rounded my-4" alt={props.alt || ""} {...props} />
  ),
};

interface MdxContentProps {
  source: string;
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose-mono">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [rehypePrettyCode, { theme: "github-dark-default", keepBackground: false }],
            ],
          },
        }}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add MDX renderer with syntax highlighting"
```

---

### Task 6: Sample Content

**Files:**
- Create: `content/posts/hello-world.mdx`
- Create: `content/tils/nextjs-app-router.mdx`
- Create: `content/links/interesting-read.mdx`

**Step 1: Create sample blog post**

Create `content/posts/hello-world.mdx`:

```mdx
---
title: "Hello World"
date: "2026-02-16"
tags: ["meta", "blog"]
summary: "Welcome to my new blog. Built with Next.js, MDX, and a love for monospace fonts."
---

This is the first post on my new blog. I built it with Next.js 15, MDX, and Tailwind CSS.

## Why another blog?

I wanted a space to share long-form thoughts, quick learnings, and interesting links I find around the web.

## The stack

- **Next.js 15** with the App Router
- **MDX** for content with React components
- **Tailwind CSS** for styling
- **Vercel** for deployment

```typescript
const greeting = "Hello, World!";
console.log(greeting);
```

More posts coming soon.
```

**Step 2: Create sample TIL**

Create `content/tils/nextjs-app-router.mdx`:

```mdx
---
title: "Next.js App Router generates static pages by default"
date: "2026-02-16"
tags: ["nextjs", "react"]
---

In Next.js 15 with the App Router, pages are statically rendered by default. You only need to opt into dynamic rendering when you use `cookies()`, `headers()`, or `searchParams`.

This means most blog content is automatically static without any extra configuration.
```

**Step 3: Create sample link**

Create `content/links/interesting-read.mdx`:

```mdx
---
title: "Towards a Science of Scaling Agent Systems"
url: "https://arxiv.org/abs/example"
date: "2026-02-16"
tags: ["ai", "agents"]
via: "Hacker News"
---

Fascinating paper on principled approaches to scaling multi-agent systems. The key insight is that coordination overhead grows non-linearly with agent count.
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add sample content (post, TIL, link)"
```

---

### Task 7: Homepage (Mixed Feed)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/feed-item.tsx`

**Step 1: Create feed item component**

Create `src/components/feed-item.tsx`:

```tsx
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
```

**Step 2: Create homepage**

Replace `src/app/page.tsx`:

```tsx
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
```

**Step 3: Verify homepage renders**

Run: `npm run dev` and check http://localhost:3000

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add homepage with mixed content feed"
```

---

### Task 8: Blog Pages (List + Detail)

**Files:**
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`

**Step 1: Create blog list page**

Create `src/app/blog/page.tsx`:

```tsx
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
```

**Step 2: Create blog detail page**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
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
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add blog list and post detail pages"
```

---

### Task 9: TIL Page

**Files:**
- Create: `src/app/til/page.tsx`

**Step 1: Create TIL page**

Create `src/app/til/page.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add TIL page with inline content"
```

---

### Task 10: Links Page

**Files:**
- Create: `src/app/links/page.tsx`

**Step 1: Create links page**

Create `src/app/links/page.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add links page"
```

---

### Task 11: Tags Page

**Files:**
- Create: `src/app/tags/[tag]/page.tsx`

**Step 1: Create tag page**

Create `src/app/tags/[tag]/page.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add tag pages"
```

---

### Task 12: About Page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Create about page**

Create `src/app/about/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-base font-semibold mb-4">about</h1>
      <div className="space-y-4 text-xs">
        <p>
          Hi, I&apos;m sigridjin. I&apos;m a software engineer.
        </p>
        <p>
          This blog is where I share long-form thoughts, quick learnings, and interesting
          links I find around the web.
        </p>
        <p>
          Built with Next.js, MDX, and Tailwind CSS. Source on{" "}
          <a href="https://github.com/sigridjineth/sigridjin.github.io">GitHub</a>.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add about page"
```

---

### Task 13: RSS Feed

**Files:**
- Create: `src/app/feed.xml/route.ts`

**Step 1: Create RSS feed route**

Create `src/app/feed.xml/route.ts`:

```ts
import { getAllContent } from "@/lib/content";

const SITE_URL = "https://sigridjin.github.io";

export async function GET() {
  const content = await getAllContent();

  const items = content
    .slice(0, 50)
    .map((item) => {
      const link =
        item.meta.type === "post"
          ? `${SITE_URL}/blog/${item.meta.slug}`
          : item.meta.type === "link"
            ? item.meta.url
            : `${SITE_URL}/til#${item.meta.slug}`;

      return `    <item>
      <title><![CDATA[${item.meta.title}]]></title>
      <link>${link}</link>
      <guid>${SITE_URL}/${item.meta.type}/${item.meta.slug}</guid>
      <pubDate>${new Date(item.meta.date).toUTCString()}</pubDate>
      <description><![CDATA[${item.content.slice(0, 500)}]]></description>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>sigridjin</title>
    <link>${SITE_URL}</link>
    <description>Personal blog</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add RSS feed"
```

---

### Task 14: SEO & Final Polish

**Files:**
- Modify: `src/app/layout.tsx` (add OpenGraph defaults)
- Create: `public/robots.txt`
- Create: `public/sitemap.xml` or `src/app/sitemap.ts`

**Step 1: Add sitemap generation**

Create `src/app/sitemap.ts`:

```ts
import { getAllPosts, getAllTils, getAllLinks, getAllTags } from "@/lib/content";
import type { MetadataRoute } from "next";

const SITE_URL = "https://sigridjin.github.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const tils = await getAllTils();
  const links = await getAllLinks();
  const tags = await getAllTags();

  const staticPages = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
    { url: `${SITE_URL}/til`, lastModified: new Date() },
    { url: `${SITE_URL}/links`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
  ];

  const postPages = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.meta.slug}`,
    lastModified: new Date(p.meta.date),
  }));

  const tagPages = tags.map((t) => ({
    url: `${SITE_URL}/tags/${t}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...postPages, ...tagPages];
}
```

**Step 2: Add robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://sigridjin.github.io/sitemap.xml
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add sitemap and robots.txt for SEO"
```

---

### Task 15: Build Verification & Push

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 2: Final commit and push**

```bash
git push origin main
```
