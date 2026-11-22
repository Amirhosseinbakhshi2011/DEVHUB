import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ کاراکتر").max(150),
  description: z.string().min(30, "توضیحات حداقل ۳۰ کاراکتر").max(20000),
  requirements: z.string().max(10000).optional().nullable(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"]),
  locationType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  location: z.string().max(120).optional().nullable(),
  salaryMin: z.number().int().min(0).optional().nullable(),
  salaryMax: z.number().int().min(0).optional().nullable(),
  currency: z.string().max(8).default("USD"),
  techStack: z.array(z.string().min(1).max(40)).max(15).default([]),
  experienceLevel: z.string().max(40).optional().nullable(),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().max(5000).optional().nullable(),
  portfolioUrl: z
    .string()
    .url("آدرس معتبر وارد کنید")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
