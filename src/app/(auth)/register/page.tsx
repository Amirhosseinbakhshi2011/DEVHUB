import Link from "next/link";

export const metadata = {
  title: "ثبت‌نام",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">
              DH
            </span>
            DEVHUB
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">ساخت حساب کاربری</h1>
          <p className="mt-2 text-sm text-slate-600">
            قبلاً ثبت‌نام کردی؟{" "}
            <Link href="/login" className="text-primary hover:underline">
              وارد شو
            </Link>
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <form className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                نام کاربری
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                placeholder="amirhossein"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="input"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                تکرار رمز عبور
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              ثبت‌نام
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">یا ثبت‌نام با</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn-secondary gap-2 text-sm">
              GitHub
            </button>
            <button type="button" className="btn-secondary gap-2 text-sm">
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
