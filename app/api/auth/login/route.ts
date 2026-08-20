import { NextResponse } from 'next/server'

const DEFAULT_ADMIN_EMAIL = 'admin@aethercm.local'
const DEFAULT_ADMIN_PASSWORD = 'AetherAdmin!2026'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const isAdminEmail = email === DEFAULT_ADMIN_EMAIL
  if (isAdminEmail && password !== DEFAULT_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 })
  }

  const role = isAdminEmail && password === DEFAULT_ADMIN_PASSWORD ? 'admin' : 'client'
  const res = NextResponse.json({ ok: true, role })

  res.cookies.set('aether_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  res.cookies.set('aether_email', email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  return res
}
