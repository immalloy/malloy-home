"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "../../../lib/blog/posts";

type BlogIndexProps = {
  posts: BlogPostMeta[];
};

function formatIndexDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function BlogIndex({ posts }: BlogIndexProps) {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const haystack = [post.title, post.description].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery === "" || haystack.includes(normalizedQuery);

      return matchesQuery;
    });
  }, [posts, query]);

  return (
    <section className="blog-section" aria-labelledby="blog-title">
      <header className="blog-header">
        <div>
          <h1 id="blog-title">blog</h1>
        </div>
        <div className="blog-header-actions">
          <p className="blog-count" aria-live="polite">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </p>
          <Link className="blog-feed-link" href="/blog/rss.xml">
            rss
          </Link>
        </div>
      </header>

      <div className="blog-tools" aria-label="Blog filters">
        <label className="blog-search">
          <span>search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="title or description"
          />
        </label>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="blog-list">
          {filteredPosts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <div className="blog-card-meta">
                <time dateTime={post.date}>{formatIndexDate(post.date)}</time>
                <span>{post.readingTime}</span>
              </div>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="blog-empty" role="status">
          <p>{posts.length === 0 ? "No published posts yet." : "No posts match that search."}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
            }}
          >
            clear filters
          </button>
        </div>
      )}
    </section>
  );
}
