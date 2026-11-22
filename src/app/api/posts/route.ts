import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations/post";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: {
          select: { userId: true },
          take: 100,
        },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const next = posts.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ posts, nextCursor });
  } catch (error) {
    console.error("[POSTS_GET]", error);
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
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const { content, codeSnippet, language } = parsed.data;

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content: content.trim(),
        codeSnippet: codeSnippet?.trim() || null,
        language: language?.trim() || null,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
