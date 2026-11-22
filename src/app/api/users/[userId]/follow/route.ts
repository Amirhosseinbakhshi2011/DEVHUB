import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyFollow } from "@/lib/notifications";

type Params = { params: Promise<{ userId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { userId } = await params;

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توانید خودتان را دنبال کنید" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      const count = await prisma.follow.count({ where: { followingId: userId } });
      return NextResponse.json({ following: false, followersCount: count });
    }

    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    const me = await prisma.developerProfile.findUnique({
      where: { userId: session.user.id },
      select: { username: true, displayName: true },
    });

    await notifyFollow({
      targetUserId: userId,
      actorId: session.user.id,
      actorName: me?.displayName ?? me?.username ?? "یک کاربر",
      actorUsername: me?.username,
    });

    const count = await prisma.follow.count({ where: { followingId: userId } });
    return NextResponse.json({ following: true, followersCount: count });
  } catch (error) {
    console.error("[FOLLOW]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    let isFollowing = false;
    if (session?.user?.id) {
      const row = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId,
          },
        },
      });
      isFollowing = !!row;
    }

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (error) {
    console.error("[FOLLOW_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
