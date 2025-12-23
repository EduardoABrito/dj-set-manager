import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SyncWave | DJ Set Manager',
  description:
    'Organize suas playlists, pastas e músicas para seus sets de DJ',

  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },

  openGraph: {
    title: 'SyncWave | DJ Set Manager',
    description:
      'Organize suas playlists, pastas e músicas para seus sets de DJ',
    images: [
      {
        url: '/icon.svg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SyncWave | DJ Set Manager',
    description:
      'Organize suas playlists, pastas e músicas para seus sets de DJ',
    images: ['/icon.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
