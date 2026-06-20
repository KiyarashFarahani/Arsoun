'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Instagram, Send } from 'lucide-react';

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FOOTER_LINKS = [
  { label: 'خانه', href: '/' },
  { label: 'محصولات', href: '/products' },
  { label: 'جستجوی سریال', href: '/lookup' },
  { label: 'تماس با ما', href: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/arsoun', label: 'اینستاگرام' },
  { icon: WhatsAppIcon, href: 'https://wa.me/989123456789', label: 'واتساپ' },
  { icon: Send, href: 'https://t.me/arsoun', label: 'تلگرام' },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="relative bg-[#010409] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-siavash font-bold text-white mb-3">آرسون</h3>
            <p className="text-sm text-gray-500 font-vazir leading-relaxed max-w-xs">
              سازنده هندپن دست‌ساز با کیفیت بالا. هر ساز با دقت و عشق ساخته شده است.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-vazir font-semibold text-gray-400 mb-4 uppercase tracking-wider">لینک‌ها</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white font-vazir text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-vazir font-semibold text-gray-400 mb-4 uppercase tracking-wider">ما را دنبال کنید</h4>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xs text-gray-600 font-vazir flex items-center gap-1.5"
          >
            ساخته شده با
            <Heart size={12} className="text-gray-600 fill-gray-600" />
            توسط تیم آرسون
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xs text-gray-600 font-vazir"
          >
            &copy; {COPYRIGHT_YEAR} آرسون Soundsculptures. تمامی حقوق محفوظ است.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
