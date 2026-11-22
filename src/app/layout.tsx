import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "@/styles/globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DEVHUB — شبکه اجتماعی توسعه‌دهندگان",
    template: "%s | DEVHUB",
  },
  description:
    "شبکه اجتماعی حرفه‌ای برای توسعه‌دهندگان. ترکیب بهترین ویژگی‌های GitHub، LinkedIn و Stack Overflow در یک پلتفرم واحد.",
  keywords: [
    "developers",
    "social network",
    "programming",
    "Q&A",
    "jobs",
    "open source",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-background font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
