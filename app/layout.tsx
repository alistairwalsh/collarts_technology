import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'GlueRatGlobal Reader',
  description: 'A minimalist Vercel-ready reader curating the core Max for Live course documents.',
  metadataBase: new URL('https://glueratglobal.vercel.app')
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={grotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
