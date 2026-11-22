"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({
  userId,
  initialFollowing,
  initialFollowersCount,
}: {
  userId: string;
  initialFollowing: boolean;
  initialFollowersCount: number;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
        setCount(data.followersCount);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={following ? "btn-secondary text-sm" : "btn-primary text-sm"}
      >
        {loading ? "..." : following ? "دنبال می‌کنید" : "دنبال کردن"}
      </button>
      <span className="text-sm text-slate-500">
        <strong className="text-slate-800">{count}</strong> دنبال‌کننده
      </span>
    </div>
  );
}
