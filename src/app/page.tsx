import Link from "next/link";
import { Code2, Users, MessageSquare, Briefcase, Trophy, Github } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "پروفایل حرفه‌ای",
    description: "رزومه زنده، مهارت‌ها، پروژه‌ها و آمار مشارکت واقعی از GitHub",
  },
  {
    icon: Code2,
    title: "فید توسعه‌دهندگان",
    description: "پست، کد اسنیپت، مقاله و بحث‌های تخصصی با سینتکس هایلایت",
  },
  {
    icon: MessageSquare,
    title: "پرسش و پاسخ",
    description: "سیستم Q&A الهام‌گرفته از Stack Overflow با رأی و پاسخ پذیرفته‌شده",
  },
  {
    icon: Briefcase,
    title: "فرصت‌های شغلی",
    description: "آگهی استخدام، فریلنس و همکاری روی پروژه‌های واقعی",
  },
  {
    icon: Trophy,
    title: "اعتبار و رتبه‌بندی",
    description: "سیستم اعتبار بر اساس فعالیت مفید، بج و لیدربورد",
  },
  {
    icon: Github,
    title: "اتصال به GitHub",
    description: "نمایش ریپازیتوری‌ها، زبان‌ها، ستاره‌ها و فعالیت واقعی",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">
              DH
            </span>
            DEVHUB
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/feed" className="hover:text-primary transition">فید</Link>
            <Link href="/questions" className="hover:text-primary transition">پرسش‌ها</Link>
            <Link href="/jobs" className="hover:text-primary transition">فرصت‌ها</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm">ورود</Link>
            <Link href="/register" className="btn-primary text-sm">ثبت‌نام</Link>
          </div>
        </div>
      </header>

      <section className="container-app py-20 md:py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            شبکه اجتماعی
            <span className="text-primary"> توسعه‌دهندگان</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            DEVHUB جایی است که توسعه‌دهندگان پروفایل حرفه‌ای می‌سازند، دانش به اشتراک
            می‌گذارند، سؤال می‌پرسند، پروژه پیدا می‌کنند و اعتبار واقعی کسب می‌کنند.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-base">شروع رایگان</Link>
            <Link href="/questions" className="btn-secondary px-8 py-3 text-base">کاوش جامعه</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className="container-app">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">همه چیز در یک پلتفرم</h2>
            <p className="mt-3 text-slate-600">ترکیب بهترین ایده‌های GitHub، LinkedIn و Stack Overflow</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6 transition hover:shadow-md hover:border-primary/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="rounded-2xl bg-primary px-8 py-14 text-center text-white">
            <h2 className="text-3xl font-bold">آماده عضویت هستی؟</h2>
            <p className="mt-3 text-primary-100 max-w-xl mx-auto">
              به جامعه‌ای از توسعه‌دهندگان بپیوند که جدی کار می‌کنند و دانش واقعی به اشتراک می‌گذارند.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary-50">
              ساخت حساب کاربری
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-xs">DH</span>
            DEVHUB
          </div>
          <p>Built with care by Amirhossein Bakhshi</p>
          <a href="https://github.com/Amirhosseinbakhshi2011/DEVHUB" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
