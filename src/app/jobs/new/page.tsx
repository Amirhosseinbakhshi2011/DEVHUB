"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

const TYPES = [
  { value: "FULL_TIME", label: "تمام‌وقت" },
  { value: "PART_TIME", label: "پاره‌وقت" },
  { value: "CONTRACT", label: "قراردادی" },
  { value: "FREELANCE", label: "فریلنس" },
  { value: "INTERNSHIP", label: "کارآموزی" },
] as const;

const LOCATIONS = [
  { value: "REMOTE", label: "دورکاری" },
  { value: "ONSITE", label: "حضوری" },
  { value: "HYBRID", label: "هیبرید" },
] as const;

export default function NewJobPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [type, setType] = useState("FULL_TIME");
  const [locationType, setLocationType] = useState("REMOTE");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [techStack, setTechStack] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          requirements: requirements.trim() || null,
          type,
          locationType,
          location: location.trim() || null,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          currency,
          techStack: techStack.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean),
          experienceLevel: experienceLevel.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ثبت آگهی");
        setLoading(false);
        return;
      }
      router.push(`/jobs/${data.job.id}`);
    } catch {
      setError("خطای شبکه");
      setLoading(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-app flex h-14 items-center">
          <Link href="/jobs" className="font-bold text-slate-900">← بازگشت به مشاغل</Link>
        </div>
      </header>
      <main className="container-app py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">ثبت آگهی شغلی</h1>
          <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">عنوان شغل *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">توضیحات *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-y min-h-[140px]" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">الزامات</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="input resize-y min-h-[100px]" disabled={loading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">نوع همکاری</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input" disabled={loading}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">مکان کار</label>
                <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="input" disabled={loading}>
                  {LOCATIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">شهر / کشور</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" disabled={loading} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">حداقل حقوق</label>
                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="input" min={0} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">حداکثر حقوق</label>
                <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="input" min={0} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ارز</label>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input" disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">استک فنی</label>
              <input value={techStack} onChange={(e) => setTechStack(e.target.value)} className="input" placeholder="Next.js, TypeScript" dir="ltr" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">سطح تجربه</label>
              <input value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input" placeholder="Junior / Mid / Senior" disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "در حال ثبت..." : "انتشار آگهی"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
