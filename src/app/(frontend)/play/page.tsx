import type { Metadata } from "next";

import HandpanPlayer from "@/components/handpan/HandpanPlayer";

export const metadata: Metadata = {
  title: "2D Handpan Player · Arsoun",
  description:
    "Explore handpan scales, discover note layouts, and find your sound with the Arsoun interactive player.",
};

export default function HandpanPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-2 pb-24 pt-32 sm:px-8 lg:px-12">
      <HandpanPlayer />
    </main>
  );
}
