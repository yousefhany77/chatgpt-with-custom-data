import { NextResponse, type NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tokens`, {
    next: {
      tags: ['tokens'],
      revalidate: false,
    },
  });
  const data = await res.json();
  const { token } = data;

  if (token === 0) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/no-tokens`);
  }
  if (request.nextUrl.pathname.includes('no-tokens')) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
