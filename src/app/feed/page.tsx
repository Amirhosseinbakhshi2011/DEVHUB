import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostCard } from "@/components/feed/post-card";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const metadata = {
  title: "فید",
};

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          profile: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { userId: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs">
              DH
            </span>
            DEVHUB
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
            <Link href="/feed" className="text-primary font-medium">
              فید
            </Link>
            {session.user.username && (
              <Link
                href={`/u/${session.user.username}`}
                className="hover:text-primary transition"
              >
                پروفایل
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <NotificationBell />
            <span className="text-slate-600 hidden sm:inline">
              {session.user.username
                ? `@${session.user.username}`
                : session.user.email}
            </span>
            <Link href="/api/auth/signout" className="text-primary hover:underline">
              خروج
            </Link>
          </div>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-xl space-y-4">
          <CreatePostForm />

          {posts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-600">هنوز پستی نیست.</p>
              <p className="mt-1 text-sm text-slate-500">
                اولین پست را منتشر کن و جامعه را شروع کن.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  createdAt: post.createdAt.toISOString(),
                }}
                currentUserId={session.user.id}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
