import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/post";
import { notifyPostComment } from "@/lib/notifications";

type Params = { params: Promise<{ postId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { postId } = await params;
    const comments = await prisma.postComment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { username: true, displayName: true, avatarUrl: true } },
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { username: true, displayName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
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

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const { content, parentId } = parsed.data;

    if (parentId) {
      const parent = await prisma.postComment.findFirst({
        where: { id: parentId, postId },
      });
      if (!parent) {
        return NextResponse.json({ error: "کامنت والد پیدا نشد" }, { status: 404 });
      }
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: content.trim(),
        parentId: parentId ?? null,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    const actorName =
      comment.author.profile?.displayName ??
      comment.author.profile?.username ??
      "یک کاربر";

    await notifyPostComment({
      postAuthorId: post.authorId,
      actorId: session.user.id,
      postId,
      commentId: comment.id,
      actorName,
      preview: content.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
