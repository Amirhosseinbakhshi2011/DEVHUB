import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CheckCircle2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VoteButtons } from "@/components/qa/vote-buttons";
import { AnswerForm } from "@/components/qa/answer-form";
import { AcceptAnswerButton } from "@/components/qa/accept-answer-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

type Props = { params: Promise<{ questionId: string }> };

export async function generateMetadata({ params }: Props) {
  const { questionId } = await params;
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { title: true },
  });
  return { title: q?.title ?? "سؤال" };
}

export default async function QuestionDetailPage({ params }: Props) {
  const { questionId } = await params;
  const session = await getServerSession(authOptions);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      author: {
        select: {
          id: true,
          profile: {
            select: { username: true, displayName: true, avatarUrl: true },
          },
        },
      },
      tags: { include: { tag: true } },
      answers: {
        orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: { username: true, displayName: true, avatarUrl: true },
              },
            },
          },
          votes: session?.user?.id
            ? { where: { userId: session.user.id }, select: { value: true } }
            : false,
        },
      },
      votes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { value: true } }
        : false,
    },
  });

  if (!question) notFound();

  prisma.question
    .update({ where: { id: questionId }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const qScoreAgg = await prisma.questionVote.aggregate({
    where: { questionId },
    _sum: { value: true },
  });
  const qScore = qScoreAgg._sum.value ?? 0;
  const qMyVote = Array.isArray(question.votes) ? question.votes[0]?.value ?? 0 : 0;

  const answerScores = await Promise.all(
    question.answers.map(async (a) => {
      const agg = await prisma.answerVote.aggregate({
        where: { answerId: a.id },
        _sum: { value: true },
      });
      return { id: a.id, score: agg._sum.value ?? 0 };
    })
  );
  const aScoreMap = Object.fromEntries(answerScores.map((s) => [s.id, s.score]));
  const isQuestionAuthor = session?.user?.id === question.authorId;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/questions" className="font-bold text-slate-900 text-sm">← سؤالات</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="text-slate-600 hover:text-primary">فید</Link>
            {session && <NotificationBell />}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <article className="card p-5">
            <div className="flex gap-4">
              <VoteButtons
                score={qScore}
                myVote={qMyVote}
                endpoint={`/api/questions/${question.id}/vote`}
                disabled={!session}
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-slate-900">{question.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {question.tags.map((t) => (
                    <Link
                      key={t.tagId}
                      href={`/questions?tag=${t.tag.slug}`}
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
                    >
                      {t.tag.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-slate-800 whitespace-pre-wrap leading-relaxed">{question.body}</div>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                  <Link
                    href={`/u/${question.author.profile?.username ?? ""}`}
                    className="font-medium text-slate-700 hover:text-primary"
                  >
                    {question.author.profile?.displayName ?? question.author.profile?.username ?? "کاربر"}
                  </Link>
                  <span>{new Date(question.createdAt).toLocaleString("fa-IR")}</span>
                  <span>{question.viewCount + 1} بازدید</span>
                  <span className={question.status === "RESOLVED" ? "text-emerald-600" : "text-slate-500"}>
                    {question.status === "RESOLVED" ? "حل‌شده" : "باز"}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{question.answers.length} پاسخ</h2>
            {question.answers.map((answer) => {
              const aMyVote = Array.isArray(answer.votes) ? answer.votes[0]?.value ?? 0 : 0;
              return (
                <article
                  key={answer.id}
                  className={`card p-5 ${answer.isAccepted ? "border-emerald-300 bg-emerald-50/30" : ""}`}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <VoteButtons
                        score={aScoreMap[answer.id] ?? 0}
                        myVote={aMyVote}
                        endpoint={`/api/answers/${answer.id}/vote`}
                        disabled={!session}
                      />
                      {answer.isAccepted && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                      {isQuestionAuthor && !answer.isAccepted && (
                        <AcceptAnswerButton answerId={answer.id} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">{answer.body}</div>
                      <div className="mt-3 text-xs text-slate-500">
                        <Link
                          href={`/u/${answer.author.profile?.username ?? ""}`}
                          className="font-medium text-slate-700 hover:text-primary"
                        >
                          {answer.author.profile?.displayName ?? answer.author.profile?.username ?? "کاربر"}
                        </Link>
                        {" · "}
                        {new Date(answer.createdAt).toLocaleString("fa-IR")}
                        {answer.isAccepted && (
                          <span className="mr-2 text-emerald-600 font-medium"> · پاسخ پذیرفته‌شده</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {session ? (
            <AnswerForm questionId={question.id} />
          ) : (
            <div className="card p-4 text-center text-sm text-slate-600">
              برای پاسخ دادن <Link href="/login" className="text-primary hover:underline">وارد شوید</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
