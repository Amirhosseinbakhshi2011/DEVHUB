"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Author = {
  id: string;
  profile: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

type Post = {
  id: string;
  content: string;
  codeSnippet: string | null;
  language: string | null;
  createdAt: string | Date;
  author: Author;
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
};

export function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(
    !!currentUserId && post.likes?.some((l) => l.userId === currentUserId)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<
    { id: string; content: string; createdAt: string; author: Author }[]
  >([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const username = post.author.profile?.username ?? "user";
  const displayName =
    post.author.profile?.displayName ?? post.author.profile?.username ?? "کاربر";

  async function toggleLike() {
    if (!currentUserId || liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } finally {
      setLiking(false);
    }
  }

  async function loadComments() {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    setShowComments(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      if (res.ok) setComments(data.comments ?? []);
    } finally {
      setLoadingComments(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        router.refresh();
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  const time = new Date(post.createdAt).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="card p-4 space-y-3">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {(displayName[0] ?? "U").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${username}`}
            className="font-medium text-slate-900 hover:text-primary truncate block"
          >
            {displayName}
          </Link>
          <p className="text-xs text-slate-500" dir="ltr">
            @{username} · {time}
          </p>
        </div>
      </header>

      <div className="text-slate-800 whitespace-pre-wrap text-[15px] leading-relaxed">
        {post.content}
      </div>

      {post.codeSnippet && (
        <div className="rounded-lg border border-slate-200 bg-slate-950 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-xs text-slate-400 border-b border-slate-800">
            <Code2 className="h-3.5 w-3.5" />
            {post.language ?? "code"}
          </div>
          <pre
            className="p-3 overflow-x-auto text-sm text-slate-100 font-mono leading-relaxed"
            dir="ltr"
          >
            <code>{post.codeSnippet}</code>
          </pre>
        </div>
      )}

      <footer className="flex items-center gap-4 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!currentUserId || liking}
          className={`inline-flex items-center gap-1.5 text-sm transition ${
            liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          {likeCount}
        </button>
        <button
          type="button"
          onClick={loadComments}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition"
        >
          <MessageCircle className="h-4 w-4" />
          {post._count.comments}
        </button>
      </footer>

      {showComments && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {loadingComments ? (
            <p className="text-sm text-slate-500">در حال بارگذاری...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500">هنوز کامنتی نیست</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                  {(
                    c.author.profile?.displayName?.[0] ??
                    c.author.profile?.username?.[0] ??
                    "U"
                  ).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-slate-800">
                    {c.author.profile?.displayName ??
                      c.author.profile?.username ??
                      "کاربر"}
                  </span>
                  <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}

          {currentUserId && (
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="نظر خود را بنویسید..."
                className="input flex-1 text-sm"
                disabled={submittingComment}
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="btn-primary text-sm px-3"
              >
                ارسال
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
