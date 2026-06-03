import type { NextRequest } from "next/server";
import { getAllBlogPosts } from "../../../lib/blog/posts";

const redisKey = "malloy:blog:last-discord-rss-slug";

function getSiteUrl() {
  return (process.env.SITE_URL || "https://malloy.vercel.app").replace(/\/$/, "");
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

async function redisCommand<T>(command: string[]) {
  const url = getRequiredEnv("UPSTASH_REDIS_REST_URL").replace(/\/$/, "");
  const token = getRequiredEnv("UPSTASH_REDIS_REST_TOKEN");
  const response = await fetch(`${url}/${command.map(encodeURIComponent).join("/")}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  return (await response.json()) as { result: T };
}

async function getLastPostedSlug() {
  const payload = await redisCommand<string | null>(["get", redisKey]);

  return payload.result;
}

async function setLastPostedSlug(slug: string) {
  await redisCommand<"OK">(["set", redisKey, slug]);
}

async function postToDiscord(post: ReturnType<typeof getAllBlogPosts>[number]) {
  const webhookUrl = getRequiredEnv("DISCORD_BLOG_WEBHOOK_URL");
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [
        {
          color: 0x82c4dc,
          description: post.description,
          title: post.title,
          url: postUrl,
          fields: [
            {
              name: "Read time",
              value: post.readingTime,
              inline: true
            },
            {
              name: "Published",
              value: post.date,
              inline: true
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = getAllBlogPosts();
  const latestPost = posts[0];

  if (!latestPost) {
    return Response.json({ posted: 0, status: "no-posts" });
  }

  const lastPostedSlug = await getLastPostedSlug();

  if (!lastPostedSlug) {
    await setLastPostedSlug(latestPost.slug);

    return Response.json({
      initialized: latestPost.slug,
      posted: 0,
      status: "initialized"
    });
  }

  const lastPostedIndex = posts.findIndex((post) => post.slug === lastPostedSlug);
  const newPosts = lastPostedIndex === -1 ? [latestPost] : posts.slice(0, lastPostedIndex);

  for (const post of [...newPosts].reverse()) {
    await postToDiscord(post);
  }

  if (newPosts.length > 0) {
    await setLastPostedSlug(newPosts[0].slug);
  }

  return Response.json({
    lastPosted: newPosts[0]?.slug ?? lastPostedSlug,
    posted: newPosts.length,
    status: "ok"
  });
}
