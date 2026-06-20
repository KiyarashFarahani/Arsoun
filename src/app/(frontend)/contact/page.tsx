'use client';

import { motion } from 'framer-motion';
import { Instagram, Phone, MessageCircle } from 'lucide-react';

const CONTACTS = [
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@arsoun',
    href: 'https://instagram.com/arsoun',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+98 912 345 6789',
    href: 'tel:+989123456789',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+98 912 345 6789',
    href: 'https://wa.me/989123456789',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            Contact Us
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-400 font-body leading-relaxed">
            For orders or questions, reach out through any of the channels below
          </p>
        </motion.div>

        <div className="space-y-4">
          {CONTACTS.map((contact, index) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ x: -4 }}
              className="flex items-center gap-4 p-6 bg-white/[0.04] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <contact.icon size={22} className="text-gray-300" />
              </div>
              <div>
                <h3 className="text-sm font-body font-semibold text-gray-400 mb-1">{contact.label}</h3>
                <p className="text-lg font-body text-white" dir="ltr">{contact.value}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 font-body">
            Bandar-e Anzali, Iran
          </p>
        </motion.div>
      </div>
    </div>
  );
}
