import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyJobSchema } from "@/lib/validations/job";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ jobId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isActive) {
      return NextResponse.json({ error: "آگهی فعال نیست" }, { status: 404 });
    }

    if (job.posterId === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توانید روی آگهی خودتان درخواست دهید" },
        { status: 400 }
      );
    }

    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: { jobId, applicantId: session.user.id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "قبلاً درخواست داده‌اید" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = applyJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: session.user.id,
        coverLetter: parsed.data.coverLetter?.trim() || null,
        portfolioUrl: parsed.data.portfolioUrl?.trim() || null,
      },
    });

    const me = await prisma.developerProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true, username: true },
    });

    await createNotification({
      userId: job.posterId,
      actorId: session.user.id,
      type: "JOB_UPDATE",
      title: "درخواست شغلی جدید",
      body: `${me?.displayName ?? me?.username ?? "یک کاربر"} برای «${job.title}» درخواست داد`,
      data: { jobId, applicationId: application.id },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("[JOB_APPLY]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
