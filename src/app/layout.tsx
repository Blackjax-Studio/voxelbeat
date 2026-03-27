import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VoxelBeat | Discover Indie Game Music & Connect with Composers",
    template: "%s | VoxelBeat"
  },
  description: "VoxelBeat is the premier platform for indie game developers to discover talented musicians and composers. Find the perfect original soundtrack for your RPG, platformer, or horror game with our advanced semantic search. Connect directly with artists and explore unique game music vibes.",
  keywords: [
    "VoxelBeat",
    "indie game music",
    "game composer",
    "video game soundtrack",
    "royalty free game music",
    "game audio",
    "indie game composer",
    "game music licensing",
    "video game OST",
    "chiptune music",
    "orchestral game music",
    "game background music",
    "game sound design",
    "hire game composer",
    "indie game developer",
    "game music directory",
    "semantic search game music"
  ],
  authors: [{ name: "Blackjax, LLC" }],
  creator: "Blackjax, LLC",
  publisher: "Blackjax, LLC",
  category: 'music',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'VoxelBeat',
    title: 'VoxelBeat | Discover Indie Game Music & Connect with Composers',
    description: 'VoxelBeat is the premier platform for indie game developers to discover talented musicians and composers. Find the perfect original soundtrack for your project with advanced semantic search.',
    images: [
      {
        url: '/lumi-logo-2.png',
        width: 1200,
        height: 630,
        alt: 'VoxelBeat - Discover Indie Game Music',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxelBeat | Discover Indie Game Music & Connect with Composers',
    description: 'VoxelBeat is the premier platform for indie game developers to discover talented musicians and composers. Find the perfect original soundtrack for your project with advanced semantic search.',
    images: ['/lumi-logo-2.png'],
    site: '@voxelbeat',
    creator: '@voxelbeat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png" }
    ],
  },
  manifest: '/manifest.json',
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VoxelBeat',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
                                     children,
                                     modal,
                                   }: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
      <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
            href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap"
            rel="stylesheet"
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "VoxelBeat",
                "alternateName": "Voxel Beat",
                "description": "Discover talented indie game musicians and composers for your video game projects. Find original game soundtracks with semantic search.",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "https://voxelbeat.com",
                "publisher": {
                  "@type": "Organization",
                  "name": "VoxelBeat",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://voxelbeat.com"}/lumi-logo-2.png`
                  }
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://voxelbeat.com"}/?search={search_term_string}`
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "VoxelBeat",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "https://voxelbeat.com",
                "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://voxelbeat.com"}/lumi-logo-2.png`,
                "sameAs": [
                  // Add social media links here if available
                ]
              }
            ])
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {modal}
        <Analytics />
      </body>
      </html>
  );
}

