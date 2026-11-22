import { z } from "zod";

export const createQuestionSchema = z.object({
  title: z
    .string()
    .min(10, "عنوان حداقل ۱۰ کاراکتر باشد")
    .max(200, "عنوان حداکثر ۲۰۰ کاراکتر"),
  body: z
    .string()
    .min(20, "متن سؤال حداقل ۲۰ کاراکتر باشد")
    .max(20000, "متن بیش از حد طولانی است"),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, "حداقل یک تگ لازم است")
    .max(5, "حداکثر ۵ تگ"),
});

export const createAnswerSchema = z.object({
  body: z
    .string()
    .min(10, "پاسخ حداقل ۱۰ کاراکتر باشد")
    .max(20000, "پاسخ بیش از حد طولانی است"),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
