import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/jwt';

// Protects every /admin page. (API routes check permissions themselves with requireRole.)
export async function middleware(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
