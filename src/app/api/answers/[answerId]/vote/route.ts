import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ answerId: string }> };

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { answerId } = await params;
    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer) {
      return NextResponse.json({ error: "پاسخ پیدا نشد" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "رأی نامعتبر" }, { status: 400 });
    }

    const { value } = parsed.data;

    const existing = await prisma.answerVote.findUnique({
      where: {
        answerId_userId: { answerId, userId: session.user.id },
      },
    });

    if (value === 0) {
      if (existing) {
        await prisma.answerVote.delete({ where: { id: existing.id } });
      }
    } else if (existing) {
      await prisma.answerVote.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      await prisma.answerVote.create({
        data: { answerId, userId: session.user.id, value },
      });
    }

    const agg = await prisma.answerVote.aggregate({
      where: { answerId },
      _sum: { value: true },
    });

    const myVote =
      value === 0
        ? 0
        : (
            await prisma.answerVote.findUnique({
              where: {
                answerId_userId: { answerId, userId: session.user.id },
              },
            })
          )?.value ?? 0;

    return NextResponse.json({ score: agg._sum.value ?? 0, myVote });
  } catch (error) {
    console.error("[ANSWER_VOTE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
