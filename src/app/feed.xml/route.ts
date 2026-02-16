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
