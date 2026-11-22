import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "داده نامعتبر" }, { status: 400 });
    }

    const { ids, all } = parsed.data;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true, marked: "all" });
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "شناسه‌ای ارسال نشده" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        id: { in: ids },
      },
      data: { isRead: true },
    });

    return NextResponse.json({ ok: true, marked: ids.length });
  } catch (error) {
    console.error("[NOTIFICATIONS_READ]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
