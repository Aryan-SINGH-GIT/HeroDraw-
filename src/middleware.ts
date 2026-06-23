import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { globalRateLimiter, authRateLimiter } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') || 
                      request.nextUrl.pathname.startsWith('/auth') || 
                      request.nextUrl.pathname.startsWith('/api/auth');

  if (isAuthRoute) {
    if (!authRateLimiter.check(ip)) {
      return new NextResponse('Too Many Requests. Please try again later.', { status: 429 });
    }
  } else {
    if (!globalRateLimiter.check(ip)) {
      return new NextResponse('Too Many Requests. Please try again later.', { status: 429 });
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common image/asset file extensions
     * - api routes (optional, but handled by the handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
