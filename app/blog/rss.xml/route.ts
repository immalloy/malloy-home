import { getAllBlogPosts } from "../../../lib/blog/posts";

const SITE_URL = "https://malloy.vercel.app";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822Date(date: string) {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function GET() {
  const posts = getAllBlogPosts();
  const latestPost = posts[0];
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${toRfc822Date(post.date)}</pubDate>
          <description>${escapeXml(post.description)}</description>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>ImMalloy Blog</title>
        <link>${SITE_URL}/blog</link>
        <description>Notes, updates, and Markdown posts from ImMalloy.</description>
        <language>en</language>
        <lastBuildDate>${toRfc822Date(latestPost?.updated ?? latestPost?.date ?? "2026-06-02")}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Disposition": "inline",
      "Content-Type": "text/xml; charset=utf-8"
    }
  });
}
