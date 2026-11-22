import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ questionId: string }> };

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { questionId } = await params;
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return NextResponse.json({ error: "سؤال پیدا نشد" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "رأی نامعتبر" }, { status: 400 });
    }

    const { value } = parsed.data;

    const existing = await prisma.questionVote.findUnique({
      where: {
        questionId_userId: { questionId, userId: session.user.id },
      },
    });

    if (value === 0) {
      if (existing) {
        await prisma.questionVote.delete({ where: { id: existing.id } });
      }
    } else if (existing) {
      await prisma.questionVote.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      await prisma.questionVote.create({
        data: { questionId, userId: session.user.id, value },
      });
    }

    const agg = await prisma.questionVote.aggregate({
      where: { questionId },
      _sum: { value: true },
    });

    const myVote =
      value === 0
        ? 0
        : (
            await prisma.questionVote.findUnique({
              where: {
                questionId_userId: { questionId, userId: session.user.id },
              },
            })
          )?.value ?? 0;

    return NextResponse.json({ score: agg._sum.value ?? 0, myVote });
  } catch (error) {
    console.error("[QUESTION_VOTE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
