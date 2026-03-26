import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  const res = await fetch('http://localhost:4000/api/dev/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'Testuser' }),
  })
  const data = await res.json()
  return NextResponse.json(data)
}
