import type { Metadata } from 'next';
import './globals.css';
// Note: AudioControl is mounted inline per-screen (CaseSelector header, InterrogationRoom TopBar)
// so it sits next to other chrome buttons instead of overlapping them.

export const metadata: Metadata = {
  title: 'חוקר פלילי — חקירה',
  description: 'משחק חקירה משטרתית. תיק אחד. חשוד אחד. חקור. שקול. החלט.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="he">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Assistant:wght@200;300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
