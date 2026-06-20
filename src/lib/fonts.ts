import { Raleway, Outfit } from 'next/font/google';

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

export const fonts = `${raleway.variable} ${outfit.variable}`;
