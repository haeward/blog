import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    repoURL: z.string().optional(),
    demoURL: z.string().optional(),
  }),
});

const about = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
  }),
});

const now = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    updated : z.coerce.date(),
  }),
});

export const collections = { blog, work, projects, about, now };
