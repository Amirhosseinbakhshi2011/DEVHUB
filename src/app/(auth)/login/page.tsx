import Link from "next/link";

export const metadata = {
  title: "ورود",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">
              DH
            </span>
            DEVHUB
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">ورود به حساب</h1>
          <p className="mt-2 text-sm text-slate-600">
            هنوز حساب نداری؟{" "}
            <Link href="/register" className="text-primary hover:underline">
              ثبت‌نام کن
            </Link>
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <form className="space-y-4">
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
                className="input"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                مرا به خاطر بسپار
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                فراموشی رمز
              </Link>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              ورود
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">یا ادامه با</span>
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

        <p className="mt-6 text-center text-xs text-slate-500">
          با ورود، شرایط استفاده و حریم خصوصی را می‌پذیرید.
        </p>
      </div>
    </div>
  );
}
