"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setDisplayName(data.profile.displayName ?? "");
          setBio(data.profile.bio ?? "");
          setLocation(data.profile.location ?? "");
          setWebsite(data.profile.website ?? "");
          setGithubUrl(data.profile.githubUrl ?? "");
          setLinkedinUrl(data.profile.linkedinUrl ?? "");
        }
      })
      .finally(() => setLoadingProfile(false));
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
          githubUrl: githubUrl.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ذخیره");
        setLoading(false);
        return;
      }
      await update({
        name: data.profile.displayName,
        username: data.profile.username,
      });
      setMessage("پروفایل ذخیره شد");
      router.refresh();
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/feed" className="font-bold text-slate-900">
            ← بازگشت به فید
          </Link>
          {session?.user?.username && (
            <Link
              href={`/u/${session.user.username}`}
              className="text-sm text-primary hover:underline"
            >
              مشاهده پروفایل
            </Link>
          )}
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900">ویرایش پروفایل</h1>
          <p className="mt-1 text-sm text-slate-500">اطلاعات عمومی پروفایل خود را به‌روز کنید.</p>

          <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">نام نمایشی</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" maxLength={80} disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">بیو</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input resize-none" rows={4} maxLength={500} disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">موقعیت</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="تهران، ایران" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">وب‌سایت</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input" placeholder="https://" dir="ltr" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub</label>
              <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="input" placeholder="https://github.com/username" dir="ltr" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn</label>
              <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="input" placeholder="https://linkedin.com/in/..." dir="ltr" disabled={loading} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
