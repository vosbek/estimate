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
    // First get the template details
    const templateResult = await client.query(`
      SELECT * FROM templates WHERE id = $1 AND is_active = true
    `, [id])
    
    if (templateResult.rows.length === 0) {
      return new NextResponse(null, { status: 404 })
    }

    // Then get the nodes and work units
    const nodesResult = await client.query(`
      SELECT 
        tn.*,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', wu.id,
            'team_id', wu.team_id,
            'hours', wu.hours
          )
        ) FILTER (WHERE wu.id IS NOT NULL) as work_units
      FROM template_nodes tn
      LEFT JOIN work_units wu ON tn.id = wu.node_id
      WHERE tn.template_id = $1
      GROUP BY tn.id
      ORDER BY tn.id
    `, [id])

    const template = {
      ...templateResult.rows[0],
      nodes: nodesResult.rows
    }
    
    return NextResponse.json(template)
  } finally {
    client.release()
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { name, description, complexity, estimatedDuration, nodes } = await request.json()

    // Update template details
    await client.query(`
      UPDATE templates 
      SET name = $1, 
          description = $2, 
          complexity = $3, 
          estimated_duration = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND is_active = true
    `, [name, description, complexity, estimatedDuration, id])

    // Delete existing nodes and work units
    await client.query('DELETE FROM work_units WHERE node_id IN (SELECT id FROM template_nodes WHERE template_id = $1)', [id])
    await client.query('DELETE FROM template_nodes WHERE template_id = $1', [id])

    // Insert new nodes
    for (const node of nodes) {
      const nodeResult = await client.query(`
        INSERT INTO template_nodes (
          template_id, 
          node_type, 
          content, 
          position
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [
        id,
        node.type,
        node.content,
        node.position ? JSON.stringify(node.position) : null
      ])

      const nodeId = nodeResult.rows[0].id

      // Insert work units if they exist
      if (node.workUnits && node.workUnits.length > 0) {
        for (const wu of node.workUnits) {
          await client.query(`
            INSERT INTO work_units (
              node_id,
              team_id,
              hours
            ) VALUES ($1, $2, $3)
          `, [nodeId, wu.team_id, wu.hours])
        }
      }
    }

    await client.query('COMMIT')
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error updating template:', error)
    return new NextResponse(null, { status: 500 })
  } finally {
    client.release()
  }
} 