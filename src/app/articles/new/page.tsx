"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NewArticlePage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function submit(statusValue: "DRAFT" | "PUBLISHED") {
    setError(null);
    const tags = tagsInput
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (title.trim().length < 5) {
      setError("عنوان حداقل ۵ کاراکتر باشد");
      return;
    }
    if (content.trim().length < 50) {
      setError("متن حداقل ۵۰ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          tags,
          status: statusValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ذخیره");
        setLoading(false);
        return;
      }
      router.push(`/articles/${data.article.slug}`);
    } catch {
      setError("خطای شبکه");
      setLoading(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-app flex h-14 items-center">
          <Link href="/articles" className="font-bold text-slate-900">← بازگشت به مقالات</Link>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">نوشتن مقاله</h1>
          <p className="mt-1 text-sm text-slate-500">می‌توانی پیش‌نویس ذخیره کنی یا مستقیم منتشر کنی.</p>

          <div className="mt-6 card p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">عنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" maxLength={200} disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">خلاصه (اختیاری)</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input resize-y min-h-[60px]" maxLength={500} disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">متن</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input resize-y min-h-[280px] font-mono text-sm" disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">تگ‌ها</label>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input" placeholder="nextjs, architecture" dir="ltr" disabled={loading} />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" disabled={loading} onClick={() => submit("DRAFT")} className="btn-secondary text-sm">
                {loading ? "..." : "ذخیره پیش‌نویس"}
              </button>
              <button type="button" disabled={loading} onClick={() => submit("PUBLISHED")} className="btn-primary text-sm">
                {loading ? "..." : "انتشار"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
