'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

const CTA = () => {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/30 to-[#020617]" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.04] rounded-2xl border border-white/[0.08]">
            <Package size={28} className="text-gray-300" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-white mb-6 leading-tight"
        >
          هندپن خودت رو
          <br />
          <span className="bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
            سفارش بده
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl text-gray-400 font-vazir max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          از طریق اینستاگرام یا واتساپ با ما در تماس باشید و هندپن مورد نظر خود را سفارش دهید.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[#020617] font-vazir font-semibold rounded-full shadow-lg shadow-white/10 hover:bg-gray-200 transition-all duration-300"
            >
              تماس با ما
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/15 text-white font-vazir font-semibold rounded-full hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              مشاهده محصولات
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-vazir"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            ارسال رایگان به سراسر جهان
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            گارانتی ۲ ساله
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            کیف سخت + روکش باران
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
