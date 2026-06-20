import type { Metadata } from "next";
import { fonts } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arsoun | Soundsculptures",
  description: "Handcrafted handpans of the highest quality | Made in Bandar-e Anzali, Iran",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={fonts}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
