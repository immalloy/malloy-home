import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  formatPostDate,
  getAllBlogPosts,
  getBlogPostBySlug
} from "../../../lib/blog/posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getYouTubeEmbedUrl(href?: string) {
  if (!href) {
    return undefined;
  }

  try {
    const url = new URL(href);
    let videoId: string | null = null;

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (url.hostname.endsWith("youtube.com")) {
      videoId = url.searchParams.get("v");
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      return undefined;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return undefined;
  }
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found"
    };
  }

  return {
    title: `${post.title} | ImMalloy`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const posts = getAllBlogPosts();
  const postIndex = posts.findIndex((item) => item.slug === post.slug);
  const newerPost = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const olderPost =
    postIndex >= 0 && postIndex < posts.length - 1 ? posts[postIndex + 1] : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    dateModified: post.updated ?? post.date,
    datePublished: post.date,
    description: post.description,
    headline: post.title,
    mainEntityOfPage: `/blog/${post.slug}`,
    url: `/blog/${post.slug}`
  };

  return (
    <main className="page blog-post-page">
      <article className="blog-article">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <Link className="blog-back-link" href="/blog">
          back to blog
        </Link>

        <header className="blog-article-header">
          <div className="blog-article-meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span>{post.readingTime}</span>
            {post.updated ? (
              <span>updated {formatPostDate(post.updated)}</span>
            ) : null}
          </div>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
        </header>

        <div className="markdown-body">
          <ReactMarkdown
            components={{
              a({ children, href }) {
                const isExternal = href?.startsWith("http");

                return (
                  <a
                    href={href}
                    rel={isExternal ? "noreferrer" : undefined}
                    target={isExternal ? "_blank" : undefined}
                  >
                    {children}
                  </a>
                );
              },
              p({ children }) {
                const childArray = Children.toArray(children).filter(
                  (child) => typeof child !== "string" || child.trim() !== ""
                );
                const onlyChild = childArray[0];

                if (childArray.length === 1 && isValidElement(onlyChild)) {
                  const href = (onlyChild.props as { href?: string }).href;
                  const embedUrl = getYouTubeEmbedUrl(href);

                  if (embedUrl) {
                    return (
                      <div className="markdown-video">
                        <iframe
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          src={embedUrl}
                          title="YouTube video"
                        />
                      </div>
                    );
                  }
                }

                return <p>{children}</p>;
              }
            }}
            remarkPlugins={[remarkGfm]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <nav className="blog-post-nav" aria-label="Blog post navigation">
          {olderPost ? (
            <Link className="blog-post-nav-link" href={`/blog/${olderPost.slug}`}>
              <span>older</span>
              <strong>{olderPost.title}</strong>
            </Link>
          ) : (
            <span className="blog-post-nav-link blog-post-nav-disabled">
              <span>older</span>
              <strong>no older posts</strong>
            </span>
          )}

          {newerPost ? (
            <Link className="blog-post-nav-link" href={`/blog/${newerPost.slug}`}>
              <span>newer</span>
              <strong>{newerPost.title}</strong>
            </Link>
          ) : (
            <span className="blog-post-nav-link blog-post-nav-disabled">
              <span>newer</span>
              <strong>no newer posts</strong>
            </span>
          )}
        </nav>
      </article>
    </main>
  );
}
