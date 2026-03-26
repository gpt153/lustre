import { NextRequest, NextResponse } from 'next/server'

const APP_HOSTNAME = 'app.lovelustre.com'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // On app.lovelustre.com, redirect root to /home
  if (hostname === APP_HOSTNAME && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
