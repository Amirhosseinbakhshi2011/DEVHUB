import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyPostLike } from "@/lib/notifications";

type Params = { params: Promise<{ postId: string }> };

export async function POST(_request: Request, { params }: Params) {
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

    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId: session.user.id },
      },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      const count = await prisma.postLike.count({ where: { postId } });
      return NextResponse.json({ liked: false, count });
    }

    await prisma.postLike.create({
      data: { postId, userId: session.user.id },
    });

    const actorProfile = await prisma.developerProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true, username: true },
    });
    const actorName =
      actorProfile?.displayName ?? actorProfile?.username ?? "یک کاربر";

    await notifyPostLike({
      postAuthorId: post.authorId,
      actorId: session.user.id,
      postId,
      actorName,
    });

    const count = await prisma.postLike.count({ where: { postId } });
    return NextResponse.json({ liked: true, count });
  } catch (error) {
    console.error("[POST_LIKE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
