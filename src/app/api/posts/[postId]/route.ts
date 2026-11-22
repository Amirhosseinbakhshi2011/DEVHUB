import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations/post";

type Params = { params: Promise<{ postId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "پست پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { postId } = await params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return NextResponse.json({ error: "پست پیدا نشد" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
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

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content.trim(),
        codeSnippet: codeSnippet?.trim() || null,
        language: language?.trim() || null,
        isEdited: true,
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
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("[POST_PATCH]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { postId } = await params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return NextResponse.json({ error: "پست پیدا نشد" }, { status: 404 });
    }

    const isOwner = post.authorId === session.user.id;
    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "MODERATOR";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
