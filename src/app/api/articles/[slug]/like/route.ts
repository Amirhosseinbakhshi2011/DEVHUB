import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { slug } = await params;
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "مقاله پیدا نشد" }, { status: 404 });
    }

    const existing = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } });
      const count = await prisma.articleLike.count({
        where: { articleId: article.id },
      });
      return NextResponse.json({ liked: false, count });
    }

    await prisma.articleLike.create({
      data: { articleId: article.id, userId: session.user.id },
    });
    const count = await prisma.articleLike.count({
      where: { articleId: article.id },
    });
    return NextResponse.json({ liked: true, count });
  } catch (error) {
    console.error("[ARTICLE_LIKE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
