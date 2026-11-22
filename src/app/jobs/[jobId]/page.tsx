import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { MapPin, Briefcase, Banknote, Clock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplyJobForm } from "@/components/jobs/apply-job-form";
import { NotificationBell } from "@/components/notifications/notification-bell";

type Props = { params: Promise<{ jobId: string }> };

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

export async function generateMetadata({ params }: Props) {
  const { jobId } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { title: true },
  });
  return { title: job?.title ?? "آگهی شغلی" };
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;
  const session = await getServerSession(authOptions);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      poster: {
        select: {
          id: true,
          profile: {
            select: { username: true, displayName: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  let hasApplied = false;
  if (session?.user?.id) {
    const app = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: { jobId, applicantId: session.user.id },
      },
    });
    hasApplied = !!app;
  }

  const isOwner = session?.user?.id === job.posterId;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/jobs" className="font-bold text-slate-900 text-sm">← مشاغل</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="text-slate-600 hover:text-primary">فید</Link>
            {session && <NotificationBell />}
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <article className="card p-6 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                {!job.isActive && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">بسته</span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                توسط{" "}
                <Link href={`/u/${job.poster.profile?.username ?? ""}`} className="text-primary hover:underline">
                  {job.poster.profile?.displayName ?? job.poster.profile?.username ?? "کاربر"}
                </Link>
                {" · "}
                {new Date(job.createdAt).toLocaleDateString("fa-IR")}
                {" · "}
                {job._count.applications} درخواست
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1">
                <Briefcase className="h-4 w-4" />{typeLabel[job.type] ?? job.type}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1">
                <MapPin className="h-4 w-4" />
                {locationLabel[job.locationType] ?? job.locationType}
                {job.location ? ` · ${job.location}` : ""}
              </span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1">
                  <Banknote className="h-4 w-4" />
                  {job.salaryMin ?? "?"} – {job.salaryMax ?? "?"} {job.currency}
                </span>
              )}
              {job.experienceLevel && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1">
                  <Clock className="h-4 w-4" />{job.experienceLevel}
                </span>
              )}
            </div>

            {job.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.techStack.map((t) => (
                  <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
                ))}
              </div>
            )}

            <div>
              <h2 className="font-semibold text-slate-900 mb-2">توضیحات</h2>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{job.description}</div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-2">الزامات</h2>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{job.requirements}</div>
              </div>
            )}
          </article>

          {isOwner ? (
            <div className="card p-4 text-sm text-slate-600">
              این آگهی متعلق به شماست. <span className="text-slate-500">({job._count.applications} درخواست)</span>
            </div>
          ) : !job.isActive ? (
            <div className="card p-4 text-sm text-slate-500 text-center">این آگهی دیگر فعال نیست.</div>
          ) : hasApplied ? (
            <div className="card p-4 text-sm text-emerald-700 bg-emerald-50 border-emerald-200 text-center">
              درخواست شما ثبت شده است.
            </div>
          ) : session ? (
            <ApplyJobForm jobId={job.id} />
          ) : (
            <div className="card p-4 text-center text-sm text-slate-600">
              برای درخواست <Link href="/login" className="text-primary hover:underline">وارد شوید</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
