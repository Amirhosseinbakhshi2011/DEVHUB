import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const metadata = {
  title: "اعلان‌ها",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs">DH</span>
            DEVHUB
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="text-slate-600 hover:text-primary">فید</Link>
            <NotificationBell />
            {session.user.username && (
              <Link href={`/u/${session.user.username}`} className="text-slate-600 hover:text-primary">
                پروفایل
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-xl">
          <NotificationsClient
            initialNotifications={notifications.map((n) => ({
              ...n,
              createdAt: n.createdAt.toISOString(),
              data: n.data as Record<string, unknown> | null,
            }))}
            initialUnreadCount={unreadCount}
          />
        </div>
      </main>
    </div>
  );
}
