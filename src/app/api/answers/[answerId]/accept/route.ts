import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ answerId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { answerId } = await params;
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer) {
      return NextResponse.json({ error: "پاسخ پیدا نشد" }, { status: 404 });
    }

    if (answer.question.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "فقط نویسنده سؤال می‌تواند پاسخ را بپذیرد" },
        { status: 403 }
      );
    }

    await prisma.answer.updateMany({
      where: { questionId: answer.questionId, isAccepted: true },
      data: { isAccepted: false },
    });

    const updated = await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    await prisma.question.update({
      where: { id: answer.questionId },
      data: {
        acceptedAnswerId: answerId,
        status: "RESOLVED",
      },
    });

    await createNotification({
      userId: answer.authorId,
      actorId: session.user.id,
      type: "ANSWER_ACCEPTED",
      title: "پاسخ شما پذیرفته شد",
      body: `پاسخ شما به سؤال «${answer.question.title.slice(0, 60)}» پذیرفته شد`,
      data: { questionId: answer.questionId, answerId },
    });

    return NextResponse.json({ answer: updated });
  } catch (error) {
    console.error("[ANSWER_ACCEPT]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
