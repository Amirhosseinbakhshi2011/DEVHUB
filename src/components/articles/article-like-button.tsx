"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function ArticleLikeButton({
  slug,
  initialLiked,
  initialCount,
  disabled,
}: {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
  disabled?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setCount(data.count);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 text-sm transition ${
        liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
      }`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </button>
  );
}
