'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSplash } from '@/contexts/SplashContext';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Serial Lookup', href: '/lookup' },
  { name: 'Contact', href: '/contact' },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const { splashDone } = useSplash();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!splashDone) return null;

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-[10001] flex justify-center pt-4 px-4 pointer-events-none"
    >
      <nav
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-3 py-2 transition-all duration-300 ${
          scrolled
            ? 'bg-black/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
            : 'bg-black/40 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
        }`}
      >
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-body font-medium transition-colors duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/15 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </motion.header>
  );
};

export default Navigation;
