import { getServerSession } from "next-auth";
import Link from "next/link";
import { MapPin, Briefcase, Banknote } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const metadata = { title: "فرصت‌های شغلی" };

const typeLabel: Record<string, string> = {
  FULL_TIME: "تمام‌وقت",
  PART_TIME: "پاره‌وقت",
  CONTRACT: "قراردادی",
  FREELANCE: "فریلنس",
  INTERNSHIP: "کارآموزی",
};

const locationLabel: Record<string, string> = {
  REMOTE: "دورکاری",
  ONSITE: "حضوری",
  HYBRID: "هیبرید",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; locationType?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const q = sp.q?.trim();
  const type = sp.type;
  const locationType = sp.locationType;

  const jobs = await prisma.job.findMany({
    take: 30,
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(type
        ? {
            type: type as
              | "FULL_TIME"
              | "PART_TIME"
              | "CONTRACT"
              | "FREELANCE"
              | "INTERNSHIP",
          }
        : {}),
      ...(locationType
        ? { locationType: locationType as "REMOTE" | "ONSITE" | "HYBRID" }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      poster: {
        select: {
          profile: { select: { username: true, displayName: true } },
        },
      },
      _count: { select: { applications: true } },
    },
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
            <Link href="/questions" className="text-slate-600 hover:text-primary">سؤالات</Link>
            <Link href="/jobs" className="text-primary font-medium">مشاغل</Link>
            {session && <NotificationBell />}
            {session ? (
              <Link href="/jobs/new" className="btn-primary text-sm">ثبت آگهی</Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm">ورود</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">فرصت‌های شغلی</h1>
            <p className="text-sm text-slate-500 mt-1">کار پیدا کن یا تیم بساز</p>
          </div>

          <form className="flex flex-wrap gap-2" action="/jobs" method="get">
            <input name="q" defaultValue={q ?? ""} placeholder="جستجو..." className="input flex-1 min-w-[200px]" />
            <select name="type" defaultValue={type ?? ""} className="input w-auto">
              <option value="">همه نوع‌ها</option>
              {Object.entries(typeLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select name="locationType" defaultValue={locationType ?? ""} className="input w-auto">
              <option value="">همه مکان‌ها</option>
              {Object.entries(locationLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary text-sm">فیلتر</button>
          </form>

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 text-sm">آگهی فعالی پیدا نشد.</div>
            ) : (
              jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="card p-4 block hover:border-primary/30 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900">{job.title}</h2>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{typeLabel[job.type] ?? job.type}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{locationLabel[job.locationType] ?? job.locationType}{job.location ? ` · ${job.location}` : ""}</span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="inline-flex items-center gap-1"><Banknote className="h-3.5 w-3.5" />{job.salaryMin ?? "?"} – {job.salaryMax ?? "?"} {job.currency}</span>
                        )}
                      </div>
                      {job.techStack.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {job.techStack.slice(0, 6).map((t) => (
                            <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 shrink-0">
                      <div>{job.poster.profile?.displayName ?? job.poster.profile?.username ?? "کاربر"}</div>
                      <div className="mt-0.5">{new Date(job.createdAt).toLocaleDateString("fa-IR")}</div>
                      <div className="mt-0.5">{job._count.applications} درخواست</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
