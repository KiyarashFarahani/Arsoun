'use client';

import { motion } from 'framer-motion';
import { FaRuler, FaWeight, FaMusic, FaShieldAlt } from 'react-icons/fa';

const FEATURES = [
  {
    icon: FaRuler,
    title: '53 cm Diameter',
    description: 'Standard handpan size',
  },
  {
    icon: FaWeight,
    title: 'Lightweight',
    description: 'Approx. 4.5 kg',
  },
  {
    icon: FaMusic,
    title: 'Various Scales',
    description: 'D Kurd, C# Annaziska & custom',
  },
  {
    icon: FaShieldAlt,
    title: '2-Year Warranty',
    description: 'Free retuning if needed',
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-neutral-900/20 to-[#0a0a0a]" />

      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-white/[0.01] rounded-full blur-[80px]" />

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
              className="inline-block px-4 py-1.5 mb-6 text-sm font-body font-medium text-gray-300 bg-white/[0.04] border border-white/[0.08] rounded-full"
            >
              About Us
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Arsoun
              <br />
              <span className="text-3xl sm:text-4xl text-gray-500">Soundsculptures</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mb-8 rounded-full" />
            <div className="space-y-5 text-gray-400 font-body leading-relaxed text-lg">
              <p>
                Arsoun is an Iranian handpan maker based in Bandar-e Anzali.
                Each instrument is crafted with precision and passion to deliver the finest sound quality.
              </p>
              <p>
                From stainless steel to nitrided, from standard scales to custom — we are here
                to create the best possible musical experience for you.
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
                className="group flex items-start gap-4 p-5 bg-white/[0.04] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/[0.04] rounded-xl border border-white/[0.06] group-hover:bg-white/[0.08] transition-all duration-300">
                  <feature.icon size={18} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-white mb-1 group-hover:text-gray-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">
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
