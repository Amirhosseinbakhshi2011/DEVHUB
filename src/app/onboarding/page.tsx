import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "شروع | DEVHUB",
};

/**
 * OAuth users land here after first sign-in.
 * For now we gently guide them to complete their profile.
 */
export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // If they already have a username, send them to feed
  if (session.user.username) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-bold">
            DH
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            خوش اومدی به DEVHUB 👋
          </h1>
          <p className="mt-2 text-slate-600 leading-relaxed">
            برای شروع، پروفایل‌ت رو کامل کن تا بقیه توسعه‌دهنده‌ها بتونن پیدا‌ت کنن.
          </p>
        </div>

        <div className="card p-6 space-y-4 text-right">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              نام نمایشی و نام کاربری
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              بیو و مهارت‌ها
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              لینک GitHub و سایت شخصی
            </li>
          </ul>

          <Link
            href="/settings/profile"
            className="btn-primary w-full py-2.5 block text-center"
          >
            تکمیل پروفایل
          </Link>

          <Link
            href="/feed"
            className="block text-center text-sm text-slate-500 hover:text-primary transition"
          >
            فعلاً رد شو → برو به فید
          </Link>
        </div>
      </div>
    </div>
  );
}
