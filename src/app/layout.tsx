import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxelBeat | Indie Game Musicians",
  description: "Indie Game Musicians",
  icons: {
    icon: [
      { url: "/lumi-logo-2.png" },
      { url: "/favicon.ico" }
    ],
  },
};

export default async function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
            href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap"
            rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
      </body>
      </html>
  );
}
