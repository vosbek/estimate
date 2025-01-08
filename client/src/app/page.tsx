import { EstimationPathSelector } from "@/components/estimation/path-selector"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

const mockPreviousEstimates = [
  {
    id: '1',
    name: 'New Variable Life Product',
    type: 'NEW_LIFE_PRODUCT',
    date: '2024-01-15',
    totalHours: 450,
    status: 'Approved',
    teams: ['Life DB', 'UI', 'Integration']
  },
  {
    id: '2',
    name: 'Term Rider Addition',
    type: 'ADD_RIDER',
    date: '2024-01-10',
    totalHours: 180,
    status: 'Pending',
    teams: ['Life DB', 'UI']
  },
  {
    id: '3',
    name: 'NY State Addition',
    type: 'EXISTING_LIFE_PRODUCT',
    date: '2024-01-05',
    totalHours: 320,
    status: 'Approved',
    teams: ['Life DB', 'Integration']
  }
]

async function getEntryPoints() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      WITH team_aggregation AS (
        SELECT 
          tn.template_id,
          COALESCE(array_agg(DISTINCT wu.team_id) FILTER (WHERE wu.team_id IS NOT NULL), ARRAY[]::varchar[]) as teams
        FROM template_nodes tn
        LEFT JOIN work_units wu ON tn.id = wu.node_id
        GROUP BY tn.template_id
      )
      SELECT DISTINCT
        ep.id,
        ep.name,
        ep.description,
        ep.template_id,
        t.complexity,
        t.estimated_duration,
        COALESCE(ta.teams, ARRAY[]::varchar[]) as teams
      FROM entry_points ep
      JOIN templates t ON t.id = ep.template_id
      LEFT JOIN team_aggregation ta ON ta.template_id = t.id
      WHERE ep.is_active = true
      ORDER BY ep.id DESC
    `)
    console.log('Entry points found:', result.rows)
    return result.rows
  } finally {
    client.release()
  }
}

export default async function Home() {
  const entryPoints = await getEntryPoints()

  return (
    <div className="space-y-8">
      {/* Branding Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 relative bg-blue-500 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600" />
          <div className="relative text-2xl text-white">:)</div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Esti <span className="text-blue-500">Mate</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Insert Project, Dispense Brilliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main estimation selector area */}
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden border-border/40 shadow-2xl shadow-primary/10">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-foreground">Start New Estimation</h2>
                <Badge variant="outline" className="text-muted-foreground border-border/50">
                  {entryPoints.length} Entry Points Available
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {entryPoints.length > 0 ? (
                  entryPoints.map((ep) => (
                    <EstimationPathSelector
                      key={ep.id}
                      id={ep.template_id}
                      title={ep.name}
                      description={ep.description || "No description provided"}
                      complexity={ep.complexity}
                      duration={ep.estimated_duration}
                      teams={ep.teams || []}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No entry points found. Please contact an administrator.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Previous estimates sidebar */}
        <div className="lg:col-span-1">
          <Card className="relative overflow-hidden border-border/40 shadow-2xl shadow-primary/10">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Estimates</h3>
                <Badge variant="secondary" className="text-xs">Last 30 days</Badge>
              </div>
              <div className="space-y-4">
                {mockPreviousEstimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="group relative p-4 rounded-lg border border-border/40 bg-gradient-to-b from-background/50 to-background hover:from-accent hover:to-accent/80 transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-foreground/90">{estimate.name}</span>
                        <Badge variant={estimate.status === 'Approved' ? 'default' : 'secondary'} className="text-xs">
                          {estimate.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{new Date(estimate.date).toLocaleDateString()}</span>
                        <span className="font-medium">{estimate.totalHours} hours</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {estimate.teams.map((team) => (
                          <Badge key={team} variant="outline" className="text-[10px] bg-background/50">
                            {team}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
