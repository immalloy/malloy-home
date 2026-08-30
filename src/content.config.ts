import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
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
    .refine((project) => project.icon || project.iconImage, {
      message: "A project must define icon or iconImage",
      path: ["iconImage"],
    }),
});

export const collections = { projects };
