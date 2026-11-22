import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/validations/qa";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const q = searchParams.get("q")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    const questions = await prisma.question.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { body: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(tag
          ? {
              tags: {
                some: {
                  tag: { slug: tag.toLowerCase() },
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        tags: { include: { tag: true } },
        _count: { select: { answers: true, votes: true } },
      },
    });

    let nextCursor: string | null = null;
    if (questions.length > limit) {
      const next = questions.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ questions, nextCursor });
  } catch (error) {
    console.error("[QUESTIONS_GET]", error);
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
    const parsed = createQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const { title, body: questionBody, tags } = parsed.data;
    const normalizedTags = [
      ...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
    ].slice(0, 5);

    const tagRecords = await Promise.all(
      normalizedTags.map(async (name) => {
        const slug = slugify(name) || name;
        return prisma.tag.upsert({
          where: { slug },
          create: { name, slug },
          update: {},
        });
      })
    );

    const question = await prisma.question.create({
      data: {
        authorId: session.user.id,
        title: title.trim(),
        body: questionBody.trim(),
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        tags: { include: { tag: true } },
        _count: { select: { answers: true, votes: true } },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
