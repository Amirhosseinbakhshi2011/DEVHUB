"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          codeSnippet: showCode && codeSnippet.trim() ? codeSnippet.trim() : null,
          language: showCode ? language : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در انتشار پست");
        setLoading(false);
        return;
      }

      setContent("");
      setCodeSnippet("");
      setShowCode(false);
      router.refresh();
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="چی در ذهنته؟ کد، ایده، یا تجربه..."
        rows={3}
        className="input resize-none"
        disabled={loading}
        maxLength={5000}
      />

      {showCode && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input w-auto text-sm"
              dir="ltr"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// کد خود را اینجا بنویسید"
            rows={6}
            className="input font-mono text-sm resize-y"
            dir="ltr"
            disabled={loading}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="text-sm text-slate-600 hover:text-primary transition"
        >
          {showCode ? "حذف کد" : "+ افزودن کد"}
        </button>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-primary text-sm px-5"
        >
          {loading ? "در حال انتشار..." : "انتشار"}
        </button>
      </div>
    </form>
  );
}
