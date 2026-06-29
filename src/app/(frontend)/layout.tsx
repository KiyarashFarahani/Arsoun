import type { Metadata, Viewport } from "next";
import { fonts } from "@/lib/fonts";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { SplashProvider } from "@/contexts/SplashContext";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Arsoun | Soundsculptures",
  description: "Handcrafted handpans of the highest quality | Made in Bandar-e Anzali, Iran",
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={fonts}>
      <body className="antialiased">
        <SplashProvider>
          <SmoothScrollProvider>
            <Navigation />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </SmoothScrollProvider>
        </SplashProvider>
      </body>
    </html>
  );
}
