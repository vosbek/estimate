import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

export async function POST(request: Request) {
  const client = await pool.connect()
  try {
    const { template_id, answers } = await request.json()

    const result = await client.query(
      `INSERT INTO completed_intakes (template_id, answers) 
       VALUES ($1, $2) 
       RETURNING id`,
      [template_id, JSON.stringify(answers)]
    )

    return NextResponse.json({ id: result.rows[0].id })
  } catch (error) {
    console.error('Failed to save completed intake:', error)
    return new NextResponse(null, { status: 500 })
  } finally {
    client.release()
  }
} 