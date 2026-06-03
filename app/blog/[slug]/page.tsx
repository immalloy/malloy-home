import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
              }
            }}
            remarkPlugins={[remarkGfm]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
