"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnswerForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) {
      setError("پاسخ حداقل ۱۰ کاراکتر باشد");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ارسال پاسخ");
        setLoading(false);
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <h3 className="font-semibold text-slate-900">پاسخ شما</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="input resize-y min-h-[120px]"
        placeholder="پاسخ خود را بنویسید..."
        disabled={loading}
      />
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "در حال ارسال..." : "ارسال پاسخ"}
      </button>
    </form>
  );
}
