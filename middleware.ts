// middleware.js at root of your Next.js project

import { NextResponse } from 'next/server';

export function middleware(request:any) {
  const { pathname } = request.nextUrl;

  // Strip trailing slash except for root "/"
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
