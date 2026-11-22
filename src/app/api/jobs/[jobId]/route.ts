import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
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

    if (!job) {
      return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
    }

    let hasApplied = false;
    if (session?.user?.id) {
      const app = await prisma.jobApplication.findUnique({
        where: {
          jobId_applicantId: { jobId, applicantId: session.user.id },
        },
      });
      hasApplied = !!app;
    }

    return NextResponse.json({ job, hasApplied });
  } catch (error) {
    console.error("[JOB_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
    }

    if (job.posterId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[JOB_DELETE]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
