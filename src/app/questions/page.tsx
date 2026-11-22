import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const metadata = {
  title: "سؤالات",
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const q = sp.q?.trim();
  const tag = sp.tag?.trim();

  const questions = await prisma.question.findMany({
    take: 30,
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag
        ? { tags: { some: { tag: { slug: tag.toLowerCase() } } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          profile: { select: { username: true, displayName: true } },
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { answers: true } },
    },
  });

  const scores = await Promise.all(
    questions.map(async (question) => {
      const agg = await prisma.questionVote.aggregate({
        where: { questionId: question.id },
        _sum: { value: true },
      });
      return { id: question.id, score: agg._sum.value ?? 0 };
    })
  );
  const scoreMap = Object.fromEntries(scores.map((s) => [s.id, s.score]));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs">DH</span>
            DEVHUB
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="text-slate-600 hover:text-primary">فید</Link>
            <Link href="/questions" className="text-primary font-medium">سؤالات</Link>
            {session && <NotificationBell />}
            {session ? (
              <Link href="/questions/ask" className="btn-primary text-sm">سؤال بپرس</Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm">ورود</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">سؤالات</h1>
              <p className="text-sm text-slate-500 mt-1">بپرس، پاسخ بده، رأی بده</p>
            </div>
            {session && (
              <Link href="/questions/ask" className="btn-primary text-sm self-start">+ سؤال جدید</Link>
            )}
          </div>

          <form className="flex gap-2" action="/questions" method="get">
            <input name="q" defaultValue={q ?? ""} placeholder="جستجو در سؤالات..." className="input flex-1" />
            <button type="submit" className="btn-secondary text-sm">جستجو</button>
          </form>

          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 text-sm">سؤالی پیدا نشد.</div>
            ) : (
              questions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="card p-4 block hover:border-primary/30 transition"
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 text-center min-w-[3rem]">
                      <span className="text-lg font-semibold text-slate-800">{scoreMap[question.id] ?? 0}</span>
                      <span className="text-[11px] text-slate-500">رأی</span>
                      <span className="text-sm font-medium text-slate-700 mt-1">{question._count.answers}</span>
                      <span className="text-[11px] text-slate-500">پاسخ</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-slate-900 line-clamp-2">{question.title}</h2>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{question.body}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {question.tags.map((t) => (
                          <span key={t.tagId} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {t.tag.name}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 mr-auto">
                          {question.author.profile?.displayName ?? question.author.profile?.username ?? "کاربر"}
                          {" · "}
                          {new Date(question.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
