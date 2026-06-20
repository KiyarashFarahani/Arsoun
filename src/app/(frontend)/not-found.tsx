import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-neutral-900/30 to-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <Image
        src="/images/logo/logo.png"
        alt="Arsoun"
        width={160}
        height={160}
        className="h-32 w-auto mb-10 invert"
        priority
      />

      <h1 className="text-4xl sm:text-5xl font-bold text-white/90 font-heading mb-4">
        404
      </h1>

      <p className="text-xl sm:text-2xl text-gray-400 font-body mb-10 text-center">
        The page you&apos;re looking for was not found
      </p>

      <Link
        href="/"
        className="px-8 py-3 bg-white text-[#0a0a0a] font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 font-body"
      >
        Back to Home
      </Link>
    </div>
  );
}
