import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lustre',
  max: 3,
})

export async function POST(req: NextRequest) {
  try {
    const { email, mode } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email krävs' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const validMode = mode === 'spicy' ? 'spicy' : 'vanilla'

    const result = await pool.query(
      `INSERT INTO waitlist (email, mode)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET mode = $2
       RETURNING id`,
      [email.toLowerCase().trim(), validMode]
    )

    const id = result.rows[0].id
    const countResult = await pool.query('SELECT COUNT(*) FROM waitlist WHERE id <= $1', [id])
    const position = parseInt(countResult.rows[0].count, 10)

    return NextResponse.json({ position })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}
