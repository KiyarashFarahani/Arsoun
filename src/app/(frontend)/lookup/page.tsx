'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function LookupPage() {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; instrument?: { serialNumber: string; title: string; scale?: string; material?: string } } | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/public/lookup?serial=${encodeURIComponent(serial.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResult({ found: true, instrument: data.instrument });
      } else {
        setResult({ found: false });
      }
    } catch {
      setResult({ found: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-siavash font-bold text-white mb-6">
            جستجوی سریال
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-400 font-vazir leading-relaxed">
            شماره سریال هندپن خود را وارد کنید تا مشخصات آن را مشاهده کنید
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="mb-10"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="شماره سریال را وارد کنید..."
              className="flex-1 px-5 py-4 bg-white/[0.08] border border-white/10 rounded-xl text-white font-vazir placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !serial.trim()}
              className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-vazir font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search size={18} />
              {loading ? 'جستجو...' : 'جستجو'}
            </motion.button>
          </div>
        </motion.form>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : result?.found && result.instrument ? (
              <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-siavash font-bold text-white mb-4">هندپن یافت شد!</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400 font-vazir">نام</span>
                    <span className="text-sm text-white font-vazir">{result.instrument.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400 font-vazir">سریال</span>
                    <span className="text-sm text-white font-vazir">{result.instrument.serialNumber}</span>
                  </div>
                  {result.instrument.scale && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400 font-vazir">مقیاس</span>
                      <span className="text-sm text-white font-vazir">{result.instrument.scale}</span>
                    </div>
                  )}
                  {result.instrument.material && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400 font-vazir">جنس</span>
                      <span className="text-sm text-white font-vazir">
                        {result.instrument.material === 'stainless-steel' ? 'استیل ضد زنگ' : result.instrument.material === 'nitrided' ? 'نیترید' : 'سفارشی'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Link
                    href={`/instruments/${result.instrument.serialNumber}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-vazir font-medium rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    مشاهده جزئیات کامل →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.05] border border-white/10 rounded-2xl">
                <p className="text-gray-400 font-vazir text-lg mb-2">هندپنی با سریال «{serial}» یافت نشد</p>
                <p className="text-sm text-gray-500 font-vazir">لطفاً شماره سریال را بررسی کنید و دوباره امتحان کنید</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
