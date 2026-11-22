"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AskQuestionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "unauthenticated") {
    router.push("/login");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const tags = tagsInput
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (title.trim().length < 10) {
      setError("عنوان حداقل ۱۰ کاراکتر باشد");
      return;
    }
    if (body.trim().length < 20) {
      setError("متن سؤال حداقل ۲۰ کاراکتر باشد");
      return;
    }
    if (tags.length === 0) {
      setError("حداقل یک تگ وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ثبت سؤال");
        setLoading(false);
        return;
      }
      router.push(`/questions/${data.question.id}`);
    } catch {
      setError("خطای شبکه");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/questions" className="font-bold text-slate-900">
            ← بازگشت به سؤالات
          </Link>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">پرسیدن سؤال</h1>
          <p className="mt-1 text-sm text-slate-500">
            عنوان واضح، جزئیات کافی و تگ‌های مرتبط بنویس.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">عنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="مثلاً: چگونه در Next.js 15 از Server Actions استفاده کنیم؟"
                maxLength={200}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">جزئیات</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input resize-y min-h-[180px]"
                placeholder="مشکل را توضیح بده، کد مرتبط را بگذار..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">تگ‌ها</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="input"
                placeholder="nextjs, react, typescript"
                dir="ltr"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">با فاصله یا ویرگول جدا کن — حداکثر ۵ تگ</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "در حال ثبت..." : "ثبت سؤال"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
