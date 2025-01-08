import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const body = await request.json()
    const { name, description, complexity, estimatedDuration, nodes, teams } = body

    // Start a transaction
    await client.query('BEGIN')

    try {
      // 1. Create the template
      const templateResult = await client.query(
        'INSERT INTO templates (name, description, complexity, estimated_duration) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, description, complexity, estimatedDuration]
      )
      const templateId = templateResult.rows[0].id

      // Create a map to store old node IDs to new database IDs
      const nodeIdMap = new Map<string, number>()

      // 2. Create nodes first
      for (const node of nodes) {
        const nodeResult = await client.query(
          'INSERT INTO template_nodes (template_id, node_type, content) VALUES ($1, $2, $3) RETURNING id',
          [templateId, node.type, node.content]
        )
        const newNodeId = nodeResult.rows[0].id
        nodeIdMap.set(node.id, newNodeId)
      }

      // 3. Now create node options with the correct IDs
      for (const node of nodes) {
        const nodeId = nodeIdMap.get(node.id)
        if (node.answers) {
          for (let i = 0; i < node.answers.length; i++) {
            const answer = node.answers[i]
            const nextNodeId = answer.nextNodeId ? nodeIdMap.get(answer.nextNodeId) : null
            
            await client.query(
              'INSERT INTO node_options (node_id, text, next_node_id, display_order) VALUES ($1, $2, $3, $4)',
              [nodeId, answer.text, nextNodeId, i]
            )

            // 4. Create work units if assigned
            if (answer.workUnitId) {
              // Get the original work unit template
              const workUnitResult = await client.query(
                'SELECT * FROM work_units WHERE id = $1',
                [answer.workUnitId]
              )
              
              if (workUnitResult.rows.length > 0) {
                const workUnit = workUnitResult.rows[0]
                console.log('Found work unit:', workUnit)
                
                // Create a new instance of the work unit for this node
                await client.query(
                  'INSERT INTO work_units (id, node_id, team_id, name, hours) VALUES ($1, $2, $3, $4, $5)',
                  [
                    `${answer.workUnitId}-${Date.now()}`, // Generate unique ID
                    nodeId,                               // Link to the node
                    workUnit.team_id,                     // Use original team
                    workUnit.name,                        // Use original name
                    workUnit.hours                        // Use original hours
                  ]
                )
              }
            }
          }
        }
      }

      // Commit the transaction
      await client.query('COMMIT')

      return NextResponse.json({ success: true, templateId })
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 