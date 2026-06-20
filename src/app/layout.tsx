import type { Metadata } from "next";
import { customFont, vazirmatn } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "آرسون | Arsoun Soundsculptures",
  description: "هندپن دست‌ساز با کیفیت بالا | ساخته شده در بندرانزلی، ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${customFont.variable} ${vazirmatn.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
