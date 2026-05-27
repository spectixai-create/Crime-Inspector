import type { Metadata, Viewport } from 'next';
import './globals.css';
// Note: AudioControl is mounted inline per-screen (CaseSelector header, InterrogationRoom TopBar)
// so it sits next to other chrome buttons instead of overlapping them.

export const metadata: Metadata = {
  title: 'חוקר פלילי — חקירה',
  description: 'משחק חקירה משטרתית. תיק אחד. חשוד אחד. חקור. שקול. החלט.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="he">
      <head>
        {/* interactive-widget is not yet part of the Next.js Viewport typing —
            add it directly so iOS/Android resize the layout when the virtual
            keyboard opens. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
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
