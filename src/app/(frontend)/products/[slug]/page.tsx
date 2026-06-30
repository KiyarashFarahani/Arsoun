'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';

type Instrument = {
  id: string | number;
  serialNumber: string;
  title: string;
  numberOfNotes?: number;
  price?: number;
  images?: { image: { url: string } }[];
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/public/instruments?category=${slug}`).then((res) => res.json()),
      fetch(`/api/public/categories`).then((res) => res.json()),
    ])
      .then(([instrumentsData, categoriesData]) => {
        setInstruments(instrumentsData.instruments || []);
        const category = categoriesData.categories?.find(
          (c: { slug: string }) => c.slug === slug,
        );
        setCategoryName(category?.name || slug);
        setCategoryDescription(category?.description || '');
      })
      .catch(() => setInstruments([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-body text-gray-400 hover:text-white transition-colors mb-6">
            ← Back to Products
          </Link>
          <h1 className="hero-gradient-text font-[var(--font-inter)] font-[100] tracking-[0.25rem] leading-[1.2] text-4xl sm:text-5xl mb-4">
            {categoryName || slug}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-gray-300/40 to-white/40 rounded-full" />
          {categoryDescription && (
            <p className="mt-6 text-lg text-gray-400 max-w-2xl font-body leading-relaxed">
              {categoryDescription}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="h-64 bg-white/[0.03] animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/[0.04] rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : instruments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-body text-lg">No instruments in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {instruments.map((instrument, index) => {
              const imageUrl = instrument.images?.[0]?.image?.url;
              return (
                <motion.div
                  key={instrument.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={`/instruments/${instrument.serialNumber}`}>
                    <div className="relative bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-500">
                      <div className={`relative h-64 overflow-hidden ${imageUrl ? 'bg-black/30' : 'bg-gradient-to-br from-white/[0.04] to-white/[0.02]'}`}>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={instrument.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white/[0.04]" />
                          </div>
                        )}


                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-lg font-heading font-bold text-white group-hover:text-gray-200 transition-colors duration-300">
                            {instrument.title}
                          </h2>
                          {instrument.price != null && instrument.price > 0 && (
                            <span className="text-base font-heading font-bold text-white shrink-0">
                              ${instrument.price.toLocaleString('en-US')}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-500 font-body">
                          {instrument.numberOfNotes && <p>Notes: {instrument.numberOfNotes}</p>}
                        </div>
                        <div className="mt-2 text-xs text-gray-600 font-body">
                          Serial: {instrument.serialNumber}
                        </div>
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
