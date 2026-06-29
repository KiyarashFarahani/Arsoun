'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const Hero = () => {
  return (
    <section id="home" className="relative w-full lg:h-screen lg:min-h-screen overflow-hidden flex flex-col">
      {/* Background image */}
      <div className="relative w-full h-[70vh] lg:h-full lg:absolute lg:inset-0">
        <Image
          src="/images/Hero/hero-cover.jpg"
          alt="Arsoun Soundsculptures"
          fill
          className="object-cover object-[position:50%_center] lg:object-center"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:from-transparent"></div>
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-start justify-center w-full lg:absolute lg:inset-0 lg:justify-end px-6 sm:px-8 lg:px-12 xl:px-20 py-10 lg:py-0 lg:pb-24 bg-[#0a0a0a] lg:bg-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-left flex flex-col items-start w-full max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h1 className="mb-4 sm:mb-6">
              <span className="block hero-gradient-text text-3xl sm:text-4xl lg:text-5xl font-[var(--font-inter)] font-[100] uppercase tracking-[0.5rem] leading-[1.2]">
                Arsoun
              </span>
              <span className="block hero-gradient-text text-base sm:text-lg lg:text-xl font-[var(--font-inter)] font-[100] uppercase tracking-[0.5rem] leading-[1.2] mt-1">
                Soundsculptures
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg text-gray-400 leading-relaxed font-body"
          >
            Handpan Maker Based in Bandar-E Anzali
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
