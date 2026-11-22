import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAnswerSchema } from "@/lib/validations/qa";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ questionId: string }> };

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
    const parsed = createAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        authorId: session.user.id,
        body: parsed.data.body.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { votes: true } },
      },
    });

    const actor =
      answer.author.profile?.displayName ??
      answer.author.profile?.username ??
      "یک کاربر";

    await createNotification({
      userId: question.authorId,
      actorId: session.user.id,
      type: "REPLY",
      title: "پاسخ جدید به سؤال شما",
      body: `${actor} به سؤال «${question.title.slice(0, 60)}» پاسخ داد`,
      data: { questionId, answerId: answer.id },
    });

    return NextResponse.json(
      { answer: { ...answer, score: 0, votes: [] } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ANSWER_POST]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
