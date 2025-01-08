import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Pool } from 'pg'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

async function getTemplatesWithEntryPoints() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        t.*,
        array_agg(DISTINCT team_id) as teams,
        json_agg(DISTINCT jsonb_build_object(
          'id', ep.id,
          'name', ep.name,
          'description', ep.description
        )) FILTER (WHERE ep.id IS NOT NULL) as entry_points
      FROM templates t
      LEFT JOIN template_nodes tn ON t.id = tn.template_id
      LEFT JOIN work_units wu ON tn.id = wu.node_id
      LEFT JOIN entry_points ep ON ep.template_id = t.id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `)
    return result.rows
  } finally {
    client.release()
  }
}

async function createEntryPoint(templateId: number, name: string, description: string) {
  const client = await pool.connect()
  try {
    await client.query(
      'INSERT INTO entry_points (template_id, name, description) VALUES ($1, $2, $3)',
      [templateId, name, description]
    )
    revalidatePath('/admin/templates')
    revalidatePath('/')
    return true
  } catch (error) {
    console.error('Error creating entry point:', error)
    return false
  } finally {
    client.release()
  }
}

export default async function TemplatesManagement() {
  const templates = await getTemplatesWithEntryPoints()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estimation Templates</h2>
          <p className="text-muted-foreground">
            Manage and create estimation templates for insurance products
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/templates/new">Create Template</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Create Entry Point
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Entry Point</DialogTitle>
                      </DialogHeader>
                      <form action={async (formData: FormData) => {
                        'use server'
                        const name = formData.get('name') as string
                        const description = formData.get('description') as string
                        await createEntryPoint(template.id, name, description)
                      }}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="e.g. New Business Quote" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                              id="description" 
                              name="description" 
                              placeholder="Describe what this entry point is for..."
                            />
                          </div>
                          <Button type="submit">Create Entry Point</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/templates/${template.id}`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/templates/${template.id}/clone`}>Clone</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-sm text-muted-foreground">Last Modified</span>
                  <p className="text-sm font-medium">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Complexity</span>
                  <p className="text-sm font-medium">{template.complexity}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <p className="text-sm font-medium">{template.estimated_duration}</p>
                </div>
                <div className="lg:col-span-1">
                  <span className="text-sm text-muted-foreground">Entry Points</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {template.entry_points?.filter(Boolean).map((ep: any) => (
                      <span
                        key={ep.id}
                        className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                      >
                        {ep.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No templates found. Click "Create Template" to create your first template.
          </div>
        )}
      </div>
    </div>
  )
} 