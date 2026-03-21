import { auth0 } from './lib/auth0';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const authResponse = await auth0.middleware(req);
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
