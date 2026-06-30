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
  'from-white/[0.06] via-white/[0.03] to-white/[0.06]',
  'from-white/[0.04] via-white/[0.02] to-white/[0.05]',
  'from-white/[0.05] via-white/[0.03] to-white/[0.04]',
  'from-white/[0.03] via-white/[0.02] to-white/[0.06]',
];

const ACCENTS = [
  'from-gray-300 to-gray-500',
  'from-gray-400 to-gray-500',
  'from-gray-300 to-gray-400',
  'from-gray-500 to-gray-400',
];

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="hero-gradient-text font-[var(--font-inter)] font-[100] tracking-[0.25rem] leading-[1.2] text-4xl sm:text-5xl mb-6">
            Our Products
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-gray-300/40 to-white/40 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body leading-relaxed">
            Handcrafted handpans available in four product lines
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="h-48 bg-white/[0.03] animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/[0.04] rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-body text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const gradient = GRADIENTS[index % GRADIENTS.length];
              const accent = ACCENTS[index % ACCENTS.length];
              const imageUrl = category.image?.url;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={`/products/${category.slug}`} className="block h-full">
                    <div className="relative bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-500 h-full flex flex-col">
                      <div className={`relative h-48 overflow-hidden ${imageUrl ? 'bg-black/30' : `bg-gradient-to-br ${gradient}`}`}>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <>
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/[0.03] rounded-full" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/[0.03] rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accent} opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500`} />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <h2 className="text-xl font-heading font-bold text-white group-hover:text-gray-200 transition-colors duration-300 mb-2">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-sm text-gray-500 font-body mb-4 leading-relaxed flex-grow">
                            {category.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-sm font-body text-gray-400 group-hover:text-gray-200 transition-colors">
                          View products →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
