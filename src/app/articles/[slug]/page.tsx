import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Clock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleLikeButton } from "@/components/articles/article-like-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    return { title: "مقاله" };
  }
  return { title: article.title, description: article.excerpt ?? undefined };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const article = await prisma.article.findUnique({
    where: { slug },
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
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { userId: true } }
        : false,
      _count: { select: { likes: true } },
    },
  });

  if (!article) notFound();

  const isOwner = session?.user?.id === article.authorId;
  if (article.status !== "PUBLISHED" && !isOwner) notFound();

  if (article.status === "PUBLISHED") {
    prisma.article
      .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});
  }

  const liked = Array.isArray(article.likes) && article.likes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/articles" className="font-bold text-slate-900 text-sm">← مقالات</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="text-slate-600 hover:text-primary">فید</Link>
            {session && <NotificationBell />}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <article className="mx-auto max-w-2xl">
          {article.status === "DRAFT" && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              این مقاله پیش‌نویس است و فقط برای شما قابل مشاهده است.
            </div>
          )}

          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{article.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href={`/u/${article.author.profile?.username ?? ""}`}
              className="font-medium text-slate-700 hover:text-primary"
            >
              {article.author.profile?.displayName ?? article.author.profile?.username ?? "کاربر"}
            </Link>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString("fa-IR")}</span>
            )}
            {article.readingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />{article.readingTime} دقیقه مطالعه
              </span>
            )}
            <span>{article.viewCount + (article.status === "PUBLISHED" ? 1 : 0)} بازدید</span>
          </div>

          {article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <Link
                  key={t.tagId}
                  href={`/articles?tag=${t.tag.slug}`}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
                >
                  {t.tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px]">
            {article.content}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-4">
            <ArticleLikeButton
              slug={article.slug}
              initialLiked={liked}
              initialCount={article._count.likes}
              disabled={!session}
            />
            {!session && (
              <Link href="/login" className="text-xs text-primary hover:underline">
                برای لایک وارد شوید
              </Link>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
