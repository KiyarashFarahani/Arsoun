'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const profileImages = [1, 2, 3, 4, 5];

const floatClasses = [
  'hero-float-1', 'hero-float-2', '', 'hero-float-4', 'hero-float-5',
];

const Hero = () => {
  return (
    <section id="home" className="relative w-full overflow-hidden h-screen lg:h-auto lg:min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-neutral-900 to-[#0a0a0a]"></div>

      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a]"></div>

      <div className="relative z-20 flex flex-col justify-center lg:justify-start lg:flex-row-reverse w-full h-screen lg:h-auto lg:min-h-screen">

        {/* Image stack */}
        <div className="relative w-full lg:w-[55%] h-[45vh] sm:h-[70vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden flex items-center justify-center lg:justify-end lg:pr-24">
          {profileImages.map((num, i) => (
            <div
              key={num}
              className={`absolute inset-0 flex items-center justify-center lg:justify-end pr-0 sm:pr-8 lg:pr-24 ${floatClasses[i]}`}
            >
              <Image
                src={`/images/profile/${num}.png`}
                alt={`Handpan ${num}`}
                width={1200}
                height={1500}
                className="object-contain h-[40vh] sm:h-[60vh] lg:h-[90vh] w-auto"
                sizes="(max-width: 1024px) 90vw, 55vw"
                priority={i < 2}
              />
            </div>
          ))}
        </div>

        {/* Text content */}
        <div className="relative w-full lg:w-[45%] flex flex-col items-center lg:items-start justify-center px-6 sm:px-8 lg:px-12 xl:px-20 py-6 sm:py-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center lg:text-left flex flex-col items-center lg:items-start w-full max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-light text-white mb-6 leading-tight">
                Arsoun
                <br />
                <span className="text-xl sm:text-2xl lg:text-3xl text-gray-500 uppercase mt-2 sm:-mt-4 block">Soundsculptures</span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto lg:ml-0 mb-4 sm:mb-8"></div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg sm:text-2xl text-gray-400 mb-4 sm:mb-8 max-w-2xl mx-auto lg:ml-0 leading-relaxed font-body"
            >
              Handcrafted handpans of the highest quality
              <br />
              <span className="text-lg text-gray-500">
                Made in Bandar-e Anzali, Iran
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-row gap-4 justify-center lg:justify-start items-center lg:items-start w-full"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/products"
                  className="px-6 py-3 h-12 sm:px-8 sm:py-4 sm:h-14 bg-white text-[#0a0a0a] font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 font-body flex items-center justify-center"
                >
                  View Products
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/lookup"
                  className="px-6 py-3 h-12 sm:px-8 sm:py-4 sm:h-14 border-2 border-white/20 text-white font-semibold rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 font-body flex items-center justify-center"
                >
                  Serial Lookup
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
