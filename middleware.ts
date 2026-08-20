import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const role = req.cookies.get('aether_role')?.value
  if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && role !== 'admin') {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
