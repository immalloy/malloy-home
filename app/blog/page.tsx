import type { Metadata } from "next";
import { BlogIndex } from "../../components/features/blog/BlogIndex";
import { getAllBlogPosts } from "../../lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog | ImMalloy",
  description: "Notes, updates, and Markdown posts from ImMalloy.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/blog/rss.xml"
    }
  },
  openGraph: {
    title: "Blog | ImMalloy",
    description: "Notes, updates, and Markdown posts from ImMalloy.",
    url: "/blog",
    type: "website"
  }
};

export default function Blog() {
  const posts = getAllBlogPosts();

  return (
    <main className="page blog-page">
      <BlogIndex posts={posts} />
    </main>
  );
}
