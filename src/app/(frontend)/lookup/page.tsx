'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';

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
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="hero-gradient-text font-[var(--font-inter)] font-[100] tracking-[0.25rem] leading-[1.2] text-4xl sm:text-5xl mb-6">
            Serial Lookup
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-gray-300/40 to-white/40 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-400 font-body leading-relaxed">
            Enter your handpan&apos;s serial number to view its specifications
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
              placeholder="Enter serial number..."
              className="flex-1 px-5 py-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white font-body placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !serial.trim()}
              className="px-6 py-4 bg-white text-[#0a0a0a] font-body font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSearch size={18} />
              {loading ? 'Searching...' : 'Search'}
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
                <div className="inline-block w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              </div>
            ) : result?.found && result.instrument ? (
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">Instrument Found!</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-sm text-gray-400 font-body">Name</span>
                    <span className="text-sm text-white font-body">{result.instrument.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-sm text-gray-400 font-body">Serial</span>
                    <span className="text-sm text-white font-body">{result.instrument.serialNumber}</span>
                  </div>
                  {result.instrument.scale && (
                    <div className="flex justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-sm text-gray-400 font-body">Scale</span>
                      <span className="text-sm text-white font-body">{result.instrument.scale}</span>
                    </div>
                  )}
                  {result.instrument.material && (
                    <div className="flex justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-sm text-gray-400 font-body">Material</span>
                      <span className="text-sm text-white font-body">
                        {result.instrument.material === 'stainless-steel' ? 'Stainless Steel' : result.instrument.material === 'nitrided' ? 'Nitrided' : 'Custom'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Link
                    href={`/instruments/${result.instrument.serialNumber}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a0a] font-body font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                <p className="text-gray-400 font-body text-lg mb-2">No instrument found with serial &laquo;{serial}&raquo;</p>
                <p className="text-sm text-gray-500 font-body">Please check the serial number and try again</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
