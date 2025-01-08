import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect()
  
  try {
    const { value } = await request.json()
    
    await client.query(
      'UPDATE templates SET is_entry_point = $1 WHERE id = $2',
      [value, parseInt(params.id)]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating template entry point:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 