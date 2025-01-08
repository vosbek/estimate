import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        ci.*,
        t.name as template_name,
        t.description as template_description,
        json_agg(
          json_build_object(
            'id', tn.id,
            'content', tn.content,
            'work_units', (
              SELECT json_agg(
                json_build_object(
                  'id', wu.id,
                  'team_id', wu.team_id,
                  'hours', wu.hours
                )
              )
              FROM work_units wu
              WHERE wu.node_id = tn.id
            )
          )
        ) as nodes
      FROM completed_intakes ci
      JOIN templates t ON t.id = ci.template_id
      JOIN template_nodes tn ON tn.template_id = t.id
      WHERE ci.id = $1
      GROUP BY ci.id, t.id
    `, [id])

    if (result.rows.length === 0) {
      return new NextResponse(null, { status: 404 })
    }

    const intake = result.rows[0]
    const template = {
      name: intake.template_name,
      description: intake.template_description,
      nodes: intake.nodes
    }

    return NextResponse.json({
      id: intake.id,
      template_id: intake.template_id,
      answers: intake.answers,
      created_at: intake.created_at,
      template
    })
  } finally {
    client.release()
  }
} 