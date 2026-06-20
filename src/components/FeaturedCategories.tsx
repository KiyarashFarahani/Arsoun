'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

type Category = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string } | null;
};

const GRADIENTS = [
  'from-amber-600/20 via-orange-500/10 to-red-600/20',
  'from-slate-600/20 via-gray-500/10 to-zinc-600/20',
  'from-yellow-600/20 via-amber-500/10 to-orange-600/20',
  'from-stone-600/20 via-gray-500/10 to-neutral-600/20',
];

const ACCENTS = [
  'from-amber-400 to-orange-400',
  'from-slate-400 to-gray-400',
  'from-yellow-400 to-amber-400',
  'from-stone-400 to-gray-400',
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function LoadingSkeleton() {
  return (
    <section id="products" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-8 w-32 bg-white/10 rounded-full mx-auto mb-6" />
          <div className="h-12 w-64 bg-white/10 rounded-lg mx-auto mb-6" />
          <div className="h-1 w-20 bg-white/10 mx-auto mb-6 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="h-48 bg-white/5 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const accent = ACCENTS[index % ACCENTS.length];
  const imageUrl = category.image?.url;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative h-full flex flex-col"
    >
      <div className="relative bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_22px_rgba(245,158,11,0.35)] h-full flex flex-col">
        <Link href={`/products/${category.slug}`} className={`block relative h-48 overflow-hidden ${imageUrl ? 'bg-black/20' : `bg-gradient-to-br ${gradient}`}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-all duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accent} opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500`} />
              </div>
            </>
          )}
        </Link>

        <div className="p-6 flex flex-col flex-grow">
          <Link href={`/products/${category.slug}`} className="block mb-2">
            <h3 className="text-xl font-siavash font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
              {category.name}
            </h3>
          </Link>
          {category.description && (
            <p className="text-sm text-gray-400 font-vazir mb-4 leading-relaxed line-clamp-2 flex-grow">
              {category.description}
            </p>
          )}
          <Link
            href={`/products/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-vazir text-amber-400 hover:text-amber-300 transition-colors"
          >
            مشاهده محصولات →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <section id="products" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            محصولات ما
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-white mb-6">
            خط تولید
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6 rounded-full" />
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-vazir leading-relaxed">
            هندپن‌های ما در چهار مدل مختلف تولید می‌شوند
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 font-vazir text-lg">به زودی محصولات اضافه می‌شوند</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
