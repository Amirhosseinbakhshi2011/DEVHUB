import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "فید",
};

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

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
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
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

      <main className="container-app py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">فید توسعه‌دهندگان</h1>
          <p className="mt-2 text-slate-600">
            خوش آمدی{session.user.name ? `، ${session.user.name}` : ""}! این صفحه
            محافظت‌شده است و فقط کاربران واردشده آن را می‌بینند.
          </p>

          <div className="mt-8 card p-6">
            <h2 className="font-semibold text-slate-900">وضعیت احراز هویت</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">شناسه کاربر</dt>
                <dd className="font-mono text-slate-800" dir="ltr">
                  {session.user.id}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">ایمیل</dt>
                <dd dir="ltr">{session.user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">نام کاربری</dt>
                <dd dir="ltr">{session.user.username ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">نقش</dt>
                <dd>{session.user.role}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            مرحله بعدی: پست، لایک و کامنت روی همین فید.
          </p>
        </div>
      </main>
    </div>
  );
}
