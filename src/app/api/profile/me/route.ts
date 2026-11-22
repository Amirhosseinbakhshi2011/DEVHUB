import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  displayName: z.string().max(80).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  githubUrl: z.string().max(300).nullable().optional(),
  linkedinUrl: z.string().max(300).nullable().optional(),
  portfolioUrl: z.string().max(300).nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const profile = await prisma.developerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "پروفایل پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[PROFILE_ME_GET]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    for (const key of ["website", "githubUrl", "linkedinUrl", "portfolioUrl"] as const) {
      const val = data[key];
      if (val && val.length > 0 && !/^https?:\/\//i.test(val)) {
        data[key] = `https://${val}`;
      }
    }

    const profile = await prisma.developerProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        website: data.website,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[PROFILE_ME_PATCH]", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
