'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const Hero = () => {
  return (
    <section id="home" className="relative w-full overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/50 to-[#020617]"></div>

      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-transparent to-[#020617]"></div>

      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-gray-300 bg-white/[0.04] border border-white/[0.08] rounded-full">
              Handpan Maker
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-siavash font-bold text-white mb-6 leading-tight"
          >
            آرسون
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-500">Soundsculptures</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-2xl leading-relaxed font-vazir"
          >
            هندپن دست‌ساز با کیفیت بالا
            <br />
            <span className="text-lg text-gray-500">
              ساخته شده در بندرانزلی، ایران
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-[#020617] font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 font-vazir flex items-center justify-center"
              >
                مشاهده محصولات
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/lookup"
                className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 font-vazir flex items-center justify-center"
              >
                جستجوی سریال
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
