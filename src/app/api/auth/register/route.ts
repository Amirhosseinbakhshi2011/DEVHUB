import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "داده نامعتبر" },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.developerProfile.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "این نام کاربری قبلاً گرفته شده است" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            username: normalizedUsername,
            displayName: normalizedUsername,
          },
        },
        accounts: {
          create: {
            provider: "CREDENTIALS",
            providerAccountId: normalizedEmail,
          },
        },
      },
      select: {
        id: true,
        email: true,
        profile: { select: { username: true } },
      },
    });

    return NextResponse.json(
      {
        message: "ثبت‌نام با موفقیت انجام شد",
        user: {
          id: user.id,
          email: user.email,
          username: user.profile?.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "خطای سرور. لطفاً دوباره تلاش کنید" },
      { status: 500 }
    );
  }
}
