import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: z
    .object({
      name: z.string(),
      description: z.string(),
      accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
      icon: z.string().optional(),
      iconImage: z.string().optional(),
      thumbnail: z.string(),
      thumbnailAlt: z.string(),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
      order: z.number().default(0),
    })
    .refine((item) => item.icon || item.iconImage, {
      message: "A portfolio item must define icon or iconImage",
      path: ["iconImage"],
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().default("Notes"),
    image: z.string().default("/assets/blog/placeholder-blog.webp"),
    imageAlt: z.string().default("Placeholder illustration for this post"),
    songUrl: z.string().url().optional(),
  }),
});

export const collections = { portfolio, blog };
