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
