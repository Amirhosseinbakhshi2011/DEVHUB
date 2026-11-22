"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  function hrefFor(n: NotificationItem): string | null {
    const data = n.data as Record<string, string> | null | undefined;
    if (!data) return null;
    if (data.postId) return "/feed";
    if (data.username) return `/u/${data.username}`;
    return null;
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "همین الان";
    if (m < 60) return `${m} دقیقه پیش`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ساعت پیش`;
    return new Date(iso).toLocaleDateString("fa-IR");
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary transition"
        aria-label="اعلان‌ها"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">اعلان‌ها</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">
                همه را خواندم
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">در حال بارگذاری...</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">اعلانی وجود ندارد</p>
            ) : (
              items.map((n) => {
                const href = hrefFor(n);
                const inner = (
                  <div
                    className={`px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      if (!n.isRead) markOneRead(n.id);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <div className={!n.isRead ? "" : "mr-4"}>
                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                        {n.body && (
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
                return href ? (
                  <Link key={n.id} href={href} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-center">
            <Link href="/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
              مشاهده همه
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
