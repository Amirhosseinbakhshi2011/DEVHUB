import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createArticleSchema } from "@/lib/validations/article";

function slugify(text: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base || "article";
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const mine = searchParams.get("mine") === "1";

    const session = await getServerSession(authOptions);

    const articles = await prisma.article.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(mine && session?.user?.id
          ? { authorId: session.user.id }
          : { status: "PUBLISHED" }),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(tag
          ? { tags: { some: { tag: { slug: tag.toLowerCase() } } } }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
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
        _count: { select: { likes: true } },
      },
    });

    let nextCursor: string | null = null;
    if (articles.length > limit) {
      const next = articles.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ articles, nextCursor });
  } catch (error) {
    console.error("[ARTICLES_GET]", error);
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
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const { title, content, excerpt, tags, status } = parsed.data;
    const normalizedTags = [
      ...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
    ].slice(0, 8);

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

    let slug = slugify(title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const article = await prisma.article.create({
      data: {
        authorId: session.user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt:
          excerpt?.trim() ||
          content.trim().slice(0, 200).replace(/\s+\S*$/, "") + "…",
        readingTime: readingTime(content),
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
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
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("[ARTICLES_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
