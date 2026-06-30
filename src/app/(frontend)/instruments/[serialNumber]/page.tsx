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
  notes?: string;
  diameter?: string;
  weight?: string;
  thickness?: string;
  dateMade?: string;
  price?: number;
  description?: { root: { children: LexicalNode[] } };
  category?: { name: string; slug: string };
  images?: { image: { url: string; alt?: string } }[];
};

type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string;
};

function renderLexicalNode(node: LexicalNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    let text: React.ReactNode = node.text || '';
    if (node.format) {
      if (node.format & 1) text = <strong key={index}>{text}</strong>;
      if (node.format & 2) text = <em key={index}>{text}</em>;
      if (node.format & 8) text = <u key={index}>{text}</u>;
    }
    return text;
  }
  const children = node.children?.map((child, i) => renderLexicalNode(child, i));
  if (node.type === 'paragraph') return <p key={index}>{children}</p>;
  if (node.type === 'heading') {
    const tag = node.tag || 'h2';
    if (tag === 'h1') return <h1 key={index}>{children}</h1>;
    if (tag === 'h3') return <h3 key={index}>{children}</h3>;
    if (tag === 'h4') return <h4 key={index}>{children}</h4>;
    return <h2 key={index}>{children}</h2>;
  }
  if (node.type === 'list' && node.tag === 'list') return <ul key={index}>{children}</ul>;
  if (node.type === 'listitem') return <li key={index}>{children}</li>;
  return <span key={index}>{children}</span>;
}

function renderDescription(description: Instrument['description']) {
  if (!description?.root?.children) return null;
  return <>{description.root.children.map((node, i) => renderLexicalNode(node, i))}</>;
}

export default function InstrumentDetailPage({ params }: { params: Promise<{ serialNumber: string }> }) {
  const { serialNumber } = use(params);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

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
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-white/[0.04] rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-12 w-64 bg-white/[0.04] rounded" />
                <div className="h-10 w-40 bg-white/[0.04] rounded" />
                <div className="h-48 bg-white/[0.03] rounded-2xl" />
              </div>
              <div className="aspect-[4/3] bg-white/[0.03] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="hero-gradient-text font-[var(--font-inter)] font-[100] tracking-[0.25rem] leading-[1.2] text-4xl mb-4">Not Found</h1>
          <p className="text-gray-400 font-body mb-8">No instrument found with serial {serialNumber}</p>
          <Link href="/lookup" className="px-6 py-3 bg-white text-[#0a0a0a] rounded-full font-body hover:bg-gray-200 transition-colors">
            Back to Lookup
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Number of Notes', value: instrument.numberOfNotes?.toString() },
    { label: 'Notes', value: instrument.notes },
    { label: 'Diameter', value: instrument.diameter },
    { label: 'Weight', value: instrument.weight },
    { label: 'Thickness', value: instrument.thickness },
    { label: 'Date Made', value: instrument.dateMade ? new Date(instrument.dateMade).toLocaleDateString('en-US') : undefined },
  ].filter((spec) => spec.value);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link
            href={instrument.category?.slug ? `/products/${instrument.category.slug}` : '/products'}
            className="inline-flex items-center gap-2 text-sm font-body text-gray-400 hover:text-white transition-colors mb-6"
          >
            ← Back
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 lg:order-1 space-y-6"
          >
            <div>
              <h1 className="hero-gradient-text font-[var(--font-inter)] font-[100] tracking-[0.25rem] leading-[1.2] text-3xl sm:text-4xl mb-2">
                {instrument.title}
              </h1>
              <p className="text-sm text-gray-600 font-body">Serial: {instrument.serialNumber}</p>
            </div>

            {instrument.price != null && instrument.price > 0 && (
              <div>
                <span className="inline-block px-5 py-2.5 text-2xl font-heading font-bold text-white bg-white/[0.06] border border-white/[0.1] rounded-xl">
                  ${instrument.price.toLocaleString('en-US')}
                </span>
              </div>
            )}

            {instrument.description && (
              <div className="font-body text-sm text-gray-400 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1">
                {renderDescription(instrument.description)}
              </div>
            )}

            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Specifications</h2>
              <div className="space-y-0">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-3 border-b border-white/[0.04] last:border-b-0">
                    <span className="text-sm text-gray-400 font-body">{spec.label}</span>
                    <span className="text-sm text-white font-body font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {instrument.category && (
              <div className="text-center">
                <Link
                  href={`/products/${instrument.category.slug}`}
                  className="text-sm font-body text-gray-400 hover:text-gray-200 transition-colors"
                >
                  View all {instrument.category.name} →
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {instrument.images && instrument.images.length > 0 ? (
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/[0.03]">
                  <Image
                    src={instrument.images[activeImage].image.url}
                    alt={instrument.images[activeImage].image.alt || instrument.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  {instrument.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((prev) => (prev === 0 ? instrument.images!.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setActiveImage((prev) => (prev === instrument.images!.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {instrument.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                              i === activeImage ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                            }`}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {instrument.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {instrument.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          i === activeImage
                            ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#0a0a0a]'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <Image
                          src={img.image.url}
                          alt={img.image.alt || `${instrument.title} ${i + 1}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/[0.04]" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
