import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 220;

export type BlogPostMeta = {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  description: string;
  draft: boolean;
  readingTime: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function assertString(value: unknown, field: string, fileName: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Blog post ${fileName} is missing a valid ${field}.`);
  }

  return value.trim();
}

function assertBoolean(value: unknown, field: string, fileName: string) {
  if (typeof value !== "boolean") {
    throw new Error(`Blog post ${fileName} is missing a valid ${field}.`);
  }

  return value;
}

function assertDate(value: unknown, field: string, fileName: string): string;
function assertDate(
  value: unknown,
  field: string,
  fileName: string,
  required: false
): string | undefined;
function assertDate(value: unknown, field: string, fileName: string, required = true) {
  if (value == null && !required) {
    return undefined;
  }

  const date =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : typeof value === "string"
        ? value.trim()
        : "";

  if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
    throw new Error(`Blog post ${fileName} has an invalid ${field}. Use YYYY-MM-DD.`);
  }

  return date;
}

function getReadingTime(content: string) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_\-[\]()`|]/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return `${minutes} min read`;
}

function parsePost(fileName: string): BlogPost {
  const filePath = path.join(BLOG_DIR, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const title = assertString(data.title, "title", fileName);
  const slug = assertString(data.slug, "slug", fileName);
  const date = assertDate(data.date, "date", fileName);
  const updated = assertDate(data.updated, "updated", fileName, false);
  const description = assertString(data.description, "description", fileName);
  const draft = assertBoolean(data.draft, "draft", fileName);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `Blog post ${fileName} has an invalid slug. Use lowercase words separated by hyphens.`
    );
  }

  return {
    title,
    slug,
    date,
    updated,
    description,
    draft,
    readingTime: getReadingTime(content),
    content: content.trim()
  };
}

function getPostFiles() {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .filter((fileName) => fileName.toLowerCase() !== "readme.md")
    .filter((fileName) => !fileName.startsWith("_"));
}

export function getAllBlogPosts({ includeDrafts = false } = {}) {
  const posts = getPostFiles().map(parsePost);
  const slugs = new Set<string>();

  for (const post of posts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug found: ${post.slug}`);
    }

    slugs.add(post.slug);
  }

  return posts
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPostBySlug(slug: string) {
  return getAllBlogPosts({ includeDrafts: false }).find((post) => post.slug === slug);
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}
