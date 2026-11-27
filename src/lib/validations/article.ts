import { z } from "zod";

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, "عنوان حداقل ۵ کاراکتر باشد")
    .max(200, "عنوان حداکثر ۲۰۰ کاراکتر"),
  content: z
    .string()
    .min(50, "متن مقاله حداقل ۵۰ کاراکتر باشد")
    .max(100000, "متن بیش از حد طولانی است"),
  excerpt: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
