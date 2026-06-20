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
  notes?: string;
  material?: string;
  diameter?: string;
  weight?: string;
  thickness?: string;
  dateMade?: string;
  status?: string;
  price?: number;
  category?: { name: string; slug: string };
  images?: { image: { url: string; alt?: string } }[];
};

export default function InstrumentDetailPage({ params }: { params: Promise<{ serialNumber: string }> }) {
  const { serialNumber } = use(params);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/public/instruments/${serialNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setInstrument(data.instrument))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [serialNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-white/[0.04] rounded" />
            <div className="h-12 w-64 bg-white/[0.04] rounded" />
            <div className="h-96 bg-white/[0.03] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="min-h-screen bg-[#020617] pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-siavash font-bold text-white mb-4">یافت نشد</h1>
          <p className="text-gray-400 font-vazir mb-8">هندپنی با سریال {serialNumber} یافت نشد</p>
          <Link href="/lookup" className="px-6 py-3 bg-white text-[#020617] rounded-full font-vazir hover:bg-gray-200 transition-colors">
            بازگشت به جستجو
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'مقیاس', value: instrument.scale },
    { label: 'تعداد نت', value: instrument.numberOfNotes?.toString() },
    { label: 'نت‌ها', value: instrument.notes },
    { label: 'جنس', value: instrument.material === 'stainless-steel' ? 'استیل ضد زنگ' : instrument.material === 'nitrided' ? 'نیترید' : instrument.material === 'custom' ? 'سفارشی' : instrument.material },
    { label: 'قطر', value: instrument.diameter },
    { label: 'وزن', value: instrument.weight },
    { label: 'ضخامت', value: instrument.thickness },
    { label: 'تاریخ ساخت', value: instrument.dateMade ? new Date(instrument.dateMade).toLocaleDateString('fa-IR') : undefined },
    { label: 'قیمت', value: instrument.price ? `${instrument.price.toLocaleString('fa-IR')} تومان` : undefined },
    { label: 'وضعیت', value: instrument.status === 'available' ? 'موجود' : instrument.status === 'sold' ? 'فروخته شده' : instrument.status === 'reserved' ? 'رزرو شده' : instrument.status },
  ].filter((spec) => spec.value);

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link
            href={instrument.category?.slug ? `/products/${instrument.category.slug}` : '/products'}
            className="inline-flex items-center gap-2 text-sm font-vazir text-gray-400 hover:text-white transition-colors mb-6"
          >
            ← بازگشت
          </Link>

          <h1 className="text-3xl sm:text-4xl font-siavash font-bold text-white mb-2">
            {instrument.title}
          </h1>
          <p className="text-sm text-gray-600 font-vazir mb-8">سریال: {instrument.serialNumber}</p>
        </motion.div>

        {instrument.images && instrument.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src={instrument.images[0].image.url}
                alt={instrument.images[0].image.alt || instrument.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            {instrument.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {instrument.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative h-24 rounded-lg overflow-hidden">
                    <Image
                      src={img.image.url}
                      alt={img.image.alt || `${instrument.title} ${i + 2}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 sm:p-8"
        >
          <h2 className="text-xl font-siavash font-bold text-white mb-6">مشخصات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between py-3 border-b border-white/[0.04]">
                <span className="text-sm text-gray-400 font-vazir">{spec.label}</span>
                <span className="text-sm text-white font-vazir font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {instrument.category && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <Link
              href={`/products/${instrument.category.slug}`}
              className="text-sm font-vazir text-gray-400 hover:text-gray-200 transition-colors"
            >
              مشاهده همه {instrument.category.name} ها →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
