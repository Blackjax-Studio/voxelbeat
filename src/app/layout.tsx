import type { Metadata } from "next";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { auth0 } from '@/lib/auth0';
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxelBeat",
  description: "Modern Music Experience by ElpepesUno",
};

export default async function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

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
        <Auth0Provider user={session?.user}>
          {children}
        </Auth0Provider>
      </body>
      </html>
  );
}
