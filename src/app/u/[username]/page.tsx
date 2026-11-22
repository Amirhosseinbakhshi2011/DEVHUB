import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { MapPin, Link as LinkIcon, Github, Calendar } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/feed/post-card";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.developerProfile.findUnique({
    where: { username: username.toLowerCase() },
  });
  if (!profile) return { title: "کاربر پیدا نشد" };
  return {
    title: profile.displayName ?? profile.username,
    description: profile.bio ?? `پروفایل ${profile.username} در DEVHUB`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const profile = await prisma.developerProfile.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          posts: {
            take: 20,
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
              _count: { select: { likes: true, comments: true } },
              likes: session?.user?.id
                ? { where: { userId: session.user.id }, select: { userId: true } }
                : false,
            },
          },
          _count: {
            select: { posts: true, followers: true, following: true },
          },
        },
      },
      skills: { include: { skill: true }, take: 12 },
    },
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const isOwner = session?.user?.id === profile.userId;
  const joined = profile.user.createdAt.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
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
          <nav className="flex items-center gap-4 text-sm">
            {session ? (
              <>
                <Link href="/feed" className="text-slate-600 hover:text-primary">
                  فید
                </Link>
                <Link href="/api/auth/signout" className="text-primary hover:underline">
                  خروج
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                ورود
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="card overflow-hidden">
            <div className="h-28 bg-gradient-to-l from-primary/20 to-primary/5" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end justify-between gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                  {(profile.displayName?.[0] ?? profile.username[0]).toUpperCase()}
                </div>
                {isOwner && (
                  <Link href="/settings/profile" className="btn-secondary text-sm">
                    ویرایش پروفایل
                  </Link>
                )}
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold text-slate-900">
                  {profile.displayName ?? profile.username}
                </h1>
                <p className="text-slate-500" dir="ltr">
                  @{profile.username}
                </p>
              </div>

              {profile.bio && (
                <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary"
                    dir="ltr"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  عضویت از {joined}
                </span>
              </div>

              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{profile.user._count.posts}</span>{" "}
                  <span className="text-slate-500">پست</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{profile.user._count.followers}</span>{" "}
                  <span className="text-slate-500">دنبال‌کننده</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{profile.user._count.following}</span>{" "}
                  <span className="text-slate-500">دنبال‌شده</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{profile.reputation}</span>{" "}
                  <span className="text-slate-500">اعتبار</span>
                </div>
              </div>

              {profile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((us) => (
                    <span
                      key={us.id}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {us.skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">پست‌ها</h2>
            {profile.user.posts.length === 0 ? (
              <div className="card p-6 text-center text-slate-500 text-sm">
                هنوز پستی منتشر نشده است.
              </div>
            ) : (
              profile.user.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    createdAt: post.createdAt.toISOString(),
                    likes: Array.isArray(post.likes) ? post.likes : [],
                  }}
                  currentUserId={session?.user?.id}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
