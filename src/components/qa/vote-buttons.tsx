"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export function VoteButtons({
  score: initialScore,
  myVote: initialMyVote,
  endpoint,
  disabled,
}: {
  score: number;
  myVote: number;
  endpoint: string;
  disabled?: boolean;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState(initialMyVote);
  const [loading, setLoading] = useState(false);

  async function vote(value: 1 | -1 | 0) {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const next = myVote === value ? 0 : value;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        setMyVote(data.myVote);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => vote(1)}
        disabled={disabled || loading}
        className={`p-1 rounded hover:bg-slate-100 ${
          myVote === 1 ? "text-primary" : "text-slate-400"
        }`}
        aria-label="upvote"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      <span
        className={`text-sm font-semibold tabular-nums ${
          score > 0 ? "text-primary" : score < 0 ? "text-red-500" : "text-slate-700"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => vote(-1)}
        disabled={disabled || loading}
        className={`p-1 rounded hover:bg-slate-100 ${
          myVote === -1 ? "text-red-500" : "text-slate-400"
        }`}
        aria-label="downvote"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
}
