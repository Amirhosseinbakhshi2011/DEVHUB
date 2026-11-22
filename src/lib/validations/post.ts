import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "متن پست نمی‌تواند خالی باشد")
    .max(5000, "حداکثر ۵۰۰۰ کاراکتر"),
  codeSnippet: z.string().max(10000).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "کامنت نمی‌تواند خالی باشد")
    .max(2000, "حداکثر ۲۰۰۰ کاراکتر"),
  parentId: z.string().cuid().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
