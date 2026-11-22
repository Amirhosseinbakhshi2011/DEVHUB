import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJobSchema } from "@/lib/validations/job";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type");
    const locationType = searchParams.get("locationType");
    const tech = searchParams.get("tech")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const cursor = searchParams.get("cursor");

    const jobs = await prisma.job.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        isActive: true,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(type
          ? {
              type: type as
                | "FULL_TIME"
                | "PART_TIME"
                | "CONTRACT"
                | "FREELANCE"
                | "INTERNSHIP",
            }
          : {}),
        ...(locationType
          ? { locationType: locationType as "REMOTE" | "ONSITE" | "HYBRID" }
          : {}),
        ...(tech ? { techStack: { has: tech } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        poster: {
          select: {
            id: true,
            profile: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    let nextCursor: string | null = null;
    if (jobs.length > limit) {
      const next = jobs.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ jobs, nextCursor });
  } catch (error) {
    console.error("[JOBS_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (
      data.salaryMin != null &&
      data.salaryMax != null &&
      data.salaryMin > data.salaryMax
    ) {
      return NextResponse.json(
        { error: "حداقل حقوق نمی‌تواند بیشتر از حداکثر باشد" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        posterId: session.user.id,
        title: data.title.trim(),
        description: data.description.trim(),
        requirements: data.requirements?.trim() || null,
        type: data.type,
        locationType: data.locationType,
        location: data.location?.trim() || null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        currency: data.currency || "USD",
        techStack: data.techStack.map((t) => t.trim()).filter(Boolean),
        experienceLevel: data.experienceLevel?.trim() || null,
      },
      include: {
        poster: {
          select: {
            id: true,
            profile: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("[JOBS_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
