import { NextRequest, NextResponse } from 'next/server'

const APP_HOSTNAME = 'app.lovelustre.com'
const PAY_HOSTNAME = 'pay.lovelustre.com'

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0]
  const pathname = request.nextUrl.pathname

  // app.lovelustre.com — redirect root to /discover
  if (host === APP_HOSTNAME && pathname === '/') {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  // pay.lovelustre.com — rewrite all paths to /pay prefix
  if (host === PAY_HOSTNAME) {
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
