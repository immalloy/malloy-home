import { ImageResponse } from "next/og";
import {
  formatPostDate,
  getAllBlogPosts,
  getBlogPostBySlug
} from "../../../lib/blog/posts";

export const alt = "Malloy blog post";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

type BlogOpenGraphImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

function clampText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export default async function Image({ params }: BlogOpenGraphImageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.title ?? "Malloy Blog";
  const description = post?.description ?? "Notes, updates, and projects from ImMalloy.";
  const date = post ? formatPostDate(post.date) : "ImMalloy";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f8fc",
          color: "#251b3a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 54,
          width: "100%"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 980
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 0.98
            }}
          >
            {clampText(title, 74)}
          </div>
          <div
            style={{
              color: "#5f5870",
              display: "flex",
              fontSize: 34,
              lineHeight: 1.22,
              maxWidth: 900
            }}
          >
            {clampText(description, 132)}
          </div>
          <div
            style={{
              color: "#5f5870",
              display: "flex",
              fontSize: 28
            }}
          >
            {date}
          </div>
        </div>
      </div>
    ),
    size
  );
}
