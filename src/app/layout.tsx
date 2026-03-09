import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StallTalk – Speak the unsaid.',
  description: 'Private anonymous communities for students, teams, and circles. No identity required. Say what you actually think.',
  keywords: ['anonymous', 'community', 'private', 'confession', 'stall', 'stalltalk'],
  openGraph: {
    title: 'StallTalk – Speak the unsaid.',
    description: 'Anonymous rooms for people who speak honestly.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display for editorial headings + Inter for body */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
