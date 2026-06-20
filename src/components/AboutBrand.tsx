'use client';

import { motion } from 'framer-motion';
import { Ruler, Weight, Music, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Ruler,
    title: 'قطر ۵۳ سانتی‌متر',
    description: 'سایز استاندارد هندپن',
  },
  {
    icon: Weight,
    title: 'وزن سبک',
    description: 'حدود ۴.۵ کیلوگرم',
  },
  {
    icon: Music,
    title: 'مقیاس‌های مختلف',
    description: 'D Kurd، C# Annaziska و سفارشی',
  },
  {
    icon: Shield,
    title: 'گارانتی ۲ ساله',
    description: 'باز کوک رایگان در صورت نیاز',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const AboutBrand = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0a1628] to-slate-900" />

      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full"
            >
              درباره ما
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-siavash font-bold text-white mb-6 leading-tight">
              آرسون
              <br />
              <span className="text-3xl sm:text-4xl text-gray-400">Soundsculptures</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mb-8 rounded-full" />
            <div className="space-y-5 text-gray-400 font-vazir leading-relaxed text-lg">
              <p>
                آرسون یک برند ایرانی سازنده هندپن است که در بندرانزلی فعالیت می‌کند.
                هر ساز با دقت و عشق ساخته می‌شود تا بهترین کیفیت صدا را ارائه دهد.
              </p>
              <p>
                از استیل ضد زنگ تا نیترید، از مقیاس‌های استاندارد تا سفارشی — ما اینجاییم
                تا بهترین تجربه صوتی را برایتان بسازیم.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ x: -4, transition: { duration: 0.2 } }}
                className="group flex items-start gap-4 p-5 bg-white/[0.08] border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.12] transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-white/10 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                  <feature.icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-siavash font-bold text-white mb-1 group-hover:text-amber-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-vazir leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutBrand;
