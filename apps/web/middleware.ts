import { NextRequest, NextResponse } from 'next/server'

const APP_HOSTNAME = 'app.lovelustre.com'
const PAY_HOSTNAME = 'pay.lovelustre.com'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // On app.lovelustre.com, redirect root to /home
  if (hostname === APP_HOSTNAME && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // On pay.lovelustre.com, rewrite all paths to /pay prefix
  if (hostname === PAY_HOSTNAME) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/pay', request.url))
    }
    if (!pathname.startsWith('/pay')) {
      return NextResponse.rewrite(new URL(`/pay${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
