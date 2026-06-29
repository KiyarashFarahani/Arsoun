'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaHeart, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Serial Lookup', href: '/lookup' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  { icon: FaInstagram, href: 'https://instagram.com/arsoun_soundsculptures', label: 'Instagram' },
  { icon: FaWhatsapp, href: 'https://wa.me/989216531511', label: 'WhatsApp' },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-heading font-bold text-white mb-3">Arsoun</h3>
            <p className="text-sm text-gray-500 font-body leading-relaxed max-w-xs">
              Crafting premium handcrafted handpans. Each instrument is made with precision and love.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-body font-semibold text-gray-400 mb-4 uppercase tracking-wider">Links</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white font-body text-sm transition-colors duration-200"
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
            <h4 className="text-sm font-body font-semibold text-gray-400 mb-4 uppercase tracking-wider">Follow Us</h4>
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
            className="text-xs text-gray-600 font-body flex items-center gap-1.5"
          >
            Made with
            <FaHeart size={12} className="text-gray-600 fill-gray-600" />
            by the Arsoun team
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xs text-gray-600 font-body"
          >
            &copy; {COPYRIGHT_YEAR} Arsoun Soundsculptures. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
