import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "نام کاربری حداقل ۳ کاراکتر باشد")
      .max(30, "نام کاربری حداکثر ۳۰ کاراکتر باشد")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و _ باشد"
      ),
    email: z.string().email("ایمیل معتبر وارد کنید"),
    password: z
      .string()
      .min(8, "رمز عبور حداقل ۸ کاراکتر باشد")
      .max(72, "رمز عبور بیش از حد طولانی است"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
