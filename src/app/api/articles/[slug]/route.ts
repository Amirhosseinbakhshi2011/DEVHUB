import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateArticleSchema } from "@/lib/validations/article";

type Params = { params: Promise<{ slug: string }> };

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "tag"
  );
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    const article = await prisma.article.findUnique({
      where: { slug },
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
        likes: session?.user?.id
          ? { where: { userId: session.user.id }, select: { userId: true } }
          : false,
        _count: { select: { likes: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "مقاله پیدا نشد" }, { status: 404 });
    }

    if (
      article.status !== "PUBLISHED" &&
      article.authorId !== session?.user?.id
    ) {
      return NextResponse.json({ error: "مقاله پیدا نشد" }, { status: 404 });
    }

    if (article.status === "PUBLISHED") {
      prisma.article
        .update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("[ARTICLE_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { slug } = await params;
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: "مقاله پیدا نشد" }, { status: 404 });
    }
    if (article.authorId !== session.user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) {
      updateData.content = data.content.trim();
      updateData.readingTime = readingTime(data.content);
    }
    if (data.excerpt !== undefined) {
      updateData.excerpt = data.excerpt?.trim() || null;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "PUBLISHED" && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (data.tags) {
      const normalized = [
        ...new Set(data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
      ].slice(0, 8);
      const tagRecords = await Promise.all(
        normalized.map(async (name) => {
          const s = slugify(name) || name;
          return prisma.tag.upsert({
            where: { slug: s },
            create: { name, slug: s },
            update: {},
          });
        })
      );
      await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
      await prisma.articleTag.createMany({
        data: tagRecords.map((tag) => ({
          articleId: article.id,
          tagId: tag.id,
        })),
      });
    }

    const updated = await prisma.article.update({
      where: { id: article.id },
      data: updateData,
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

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error("[ARTICLE_PATCH]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { slug } = await params;
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: "مقاله پیدا نشد" }, { status: 404 });
    }
    if (article.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    await prisma.article.delete({ where: { id: article.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ARTICLE_DELETE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
