"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplyJobForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || null,
          portfolioUrl: portfolioUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ارسال درخواست");
        setLoading(false);
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("خطای شبکه");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-4 text-sm text-emerald-700 bg-emerald-50 border-emerald-200 text-center">
        درخواست شما با موفقیت ثبت شد.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <h3 className="font-semibold text-slate-900">ارسال درخواست</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm text-slate-600 mb-1">نامه معرفی (اختیاری)</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="input resize-y min-h-[100px]"
          placeholder="چرا برای این موقعیت مناسب هستید..."
          disabled={loading}
          maxLength={5000}
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600 mb-1">لینک پورتفolio / GitHub (اختیاری)</label>
        <input
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="input"
          placeholder="https://github.com/you"
          dir="ltr"
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary text-sm w-full">
        {loading ? "در حال ارسال..." : "ارسال درخواست"}
      </button>
    </form>
  );
}
