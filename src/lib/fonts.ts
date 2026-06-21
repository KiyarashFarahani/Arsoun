import { Raleway, Outfit, Inter } from 'next/font/google';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['100', '300'],
  variable: '--font-heading',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['200'],
  variable: '--font-inter',
  display: 'swap',
});

export const fonts = `${raleway.variable} ${outfit.variable} ${inter.variable}`;
