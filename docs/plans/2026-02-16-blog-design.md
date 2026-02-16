# Blog Design: sigridjin.github.io

## Overview

Personal blog inspired by shumer.dev/blog (monospace minimalism) and simonwillison.net (rich content organization). Blends monospace developer aesthetic with structured content types.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Content**: MDX files in git (`content/posts/`, `content/tils/`, `content/links/`)
- **Styling**: Tailwind CSS + CSS custom properties for theming
- **MDX**: `next-mdx-remote` + `gray-matter` for frontmatter
- **Code highlighting**: `rehype-pretty-code` + Shiki
- **Deploy**: Vercel

## Visual Design

- **Font**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Courier New`
- **Layout**: Single column, max-width 720px, generous padding
- **Colors**: Dark mode default. Dark: `#0a0a0a` bg / `#e5e5e5` text. Light: white bg / dark text. Toggle in header.
- **Spacing**: 1.7 line-height, 24-32px between elements
- **Links**: Subtle underline animation on hover

## Pages & Routing

| Route | Purpose |
|-------|---------|
| `/` | Homepage — mixed chronological feed |
| `/blog` | All blog posts, filterable by tag |
| `/blog/[slug]` | Individual post |
| `/til` | All TIL entries |
| `/links` | Curated links with commentary |
| `/tags/[tag]` | All content with a given tag |
| `/about` | About page |

## Navigation

- **Header**: Site name (left) + nav links (Blog, TIL, Links, About) + theme toggle (right)
- **Footer**: Year archives, tag cloud, RSS link

## Content Types

### Posts
Long-form articles. Frontmatter: `title, date, tags[], summary, draft?`

### TILs
Short learnings (1-3 paragraphs). Frontmatter: `title, date, tags[]`

### Links
External URL + commentary. Frontmatter: `title, url, date, tags[], via?`

## Homepage Feed

Mixed chronological feed of all content types with visual indicators:
- Posts: title + summary + date + tags
- TILs: title + full content inline + date
- Links: title (linked externally) + commentary + date

## Features

- Dark/light mode with system preference + manual toggle
- RSS feed (`/feed.xml`)
- Tag-based filtering and tag pages
- Syntax highlighting for code blocks
- SEO: Open Graph tags, meta descriptions
- Responsive (mobile-first)
