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
  scale?: string;
  numberOfNotes?: number;
  material?: string;
  status?: string;
  images?: { image: { url: string } }[];
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetch(`/api/public/instruments?category=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setInstruments(data.instruments || []);
        if (data.instruments?.length > 0 && data.instruments[0].category) {
          setCategoryName(data.instruments[0].category.name || slug);
        } else {
          setCategoryName(slug);
        }
      })
      .catch(() => setInstruments([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-vazir text-gray-400 hover:text-white transition-colors mb-6">
            ← بازگشت به محصولات
          </Link>
          <h1 className="text-4xl sm:text-5xl font-siavash font-bold text-white mb-4">
            {categoryName || slug}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-64 bg-white/5 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : instruments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 font-vazir text-lg">هنوز محصولی در این دسته‌بندی ثبت نشده</p>
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
                    <div className="relative bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500">
                      <div className={`relative h-64 overflow-hidden ${imageUrl ? 'bg-black/20' : 'bg-gradient-to-br from-amber-600/20 to-orange-600/20'}`}>
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
                            <div className="w-24 h-24 rounded-full bg-amber-500/20" />
                          </div>
                        )}

                        {instrument.status && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 rounded-full text-xs font-vazir text-white/90 border border-white/10">
                            {instrument.status === 'available' ? 'موجود' : instrument.status === 'sold' ? 'فروخته شده' : 'رزرو شده'}
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h2 className="text-lg font-siavash font-bold text-white group-hover:text-amber-300 transition-colors duration-300 mb-2">
                          {instrument.title}
                        </h2>
                        <div className="space-y-1 text-sm text-gray-400 font-vazir">
                          {instrument.scale && <p>مقیاس: {instrument.scale}</p>}
                          {instrument.numberOfNotes && <p>تعداد نت: {instrument.numberOfNotes}</p>}
                          {instrument.material && <p>جنس: {instrument.material === 'stainless-steel' ? 'استیل ضد زنگ' : instrument.material === 'nitrided' ? 'نیترید' : 'سفارشی'}</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <span className="text-xs text-gray-500 font-vazir">سریال: {instrument.serialNumber}</span>
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
