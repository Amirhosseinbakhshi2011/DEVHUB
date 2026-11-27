import { getServerSession } from "next-auth";
import Link from "next/link";
import { Clock, Heart } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata = { title: "مقالات" };

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const q = sp.q?.trim();
  const tag = sp.tag?.trim();

  const articles = await prisma.article.findMany({
    take: 30,
    where: {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag
        ? { tags: { some: { tag: { slug: tag.toLowerCase() } } } }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: {
          profile: { select: { username: true, displayName: true } },
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
    },
  });

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
            <Link href="/questions" className="text-slate-600 hover:text-primary">سؤالات</Link>
            <Link href="/articles" className="text-primary font-medium">مقالات</Link>
            <Link href="/jobs" className="text-slate-600 hover:text-primary">مشاغل</Link>
            {session && <NotificationBell />}
            {session ? (
              <Link href="/articles/new" className="btn-primary text-sm">نوشتن مقاله</Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm">ورود</Link>
            )}
            {session && <SignOutButton />}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">مقالات</h1>
            <p className="text-sm text-slate-500 mt-1">دانش فنی را به اشتراک بگذار</p>
          </div>

          <form className="flex gap-2" action="/articles" method="get">
            <input name="q" defaultValue={q ?? ""} placeholder="جستجو در مقالات..." className="input flex-1" />
            <button type="submit" className="btn-secondary text-sm">جستجو</button>
          </form>

          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 text-sm">
                مقاله‌ای پیدا نشد.
                {session && (
                  <div className="mt-3">
                    <Link href="/articles/new" className="text-primary hover:underline">اولین مقاله را بنویس</Link>
                  </div>
                )}
              </div>
            ) : (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="card p-5 block hover:border-primary/30 transition"
                >
                  <h2 className="text-lg font-semibold text-slate-900">{article.title}</h2>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{article.author.profile?.displayName ?? article.author.profile?.username ?? "کاربر"}</span>
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString("fa-IR")}</span>
                    )}
                    {article.readingTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />{article.readingTime} دقیقه
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />{article._count.likes}
                    </span>
                    {article.tags.map((t) => (
                      <span key={t.tagId} className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
                        {t.tag.name}
                      </span>
                    ))}
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
