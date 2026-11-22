"use client";

import { useState } from "react";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
};

const typeLabel: Record<string, string> = {
  FOLLOW: "دنبال کردن",
  LIKE: "لایک",
  COMMENT: "کامنت",
  REPLY: "پاسخ",
  MENTION: "منشن",
  MESSAGE: "پیام",
  ANSWER_ACCEPTED: "پاسخ پذیرفته‌شده",
  JOB_UPDATE: "فرصت شغلی",
  COLLABORATION: "همکاری",
  COMMUNITY_INVITE: "دعوت جامعه",
  SYSTEM: "سیستم",
};

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [items, setItems] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markOne(id: string) {
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

  const visible = filter === "unread" ? items.filter((n) => !n.isRead) : items;

  function hrefFor(n: NotificationItem): string | null {
    const data = n.data as Record<string, string> | null | undefined;
    if (!data) return null;
    if (data.postId) return "/feed";
    if (data.username) return `/u/${data.username}`;
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">اعلان‌ها</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} اعلان خوانده‌نشده`
              : "همه اعلان‌ها خوانده شده‌اند"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="btn-secondary text-sm">
            همه را خواندم
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            filter === "all" ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          همه
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            filter === "unread" ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          خوانده‌نشده
        </button>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">اعلانی برای نمایش نیست</p>
        ) : (
          visible.map((n) => {
            const href = hrefFor(n);
            const content = (
              <div
                className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition ${!n.isRead ? "bg-primary/[0.03]" : ""}`}
                onClick={() => {
                  if (!n.isRead) markOne(n.id);
                }}
              >
                <div className="mt-1">
                  {!n.isRead ? (
                    <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : (
                    <span className="block h-2.5 w-2.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                      {typeLabel[n.type] ?? n.type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-1">{n.title}</p>
                  {n.body && <p className="text-sm text-slate-600 mt-0.5">{n.body}</p>}
                </div>
              </div>
            );
            return href ? (
              <Link key={n.id} href={href}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
