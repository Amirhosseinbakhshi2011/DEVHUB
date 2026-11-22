"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function AcceptAnswerButton({ answerId }: { answerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answerId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={accept}
      disabled={loading}
      title="پذیرش به عنوان پاسخ درست"
      className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition"
    >
      <Check className="h-5 w-5" />
    </button>
  );
}
