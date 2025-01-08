'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

interface CompletedIntake {
  id: number
  template_id: number
  answers: Record<string, string>
  created_at: string
  template: {
    name: string
    description: string
    nodes: Array<{
      id: number
      content: string
      work_units?: Array<{
        id: number
        team_id: string
        hours: number
      }>
    }>
  }
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const intakeId = searchParams.get('id')
  const [intake, setIntake] = useState<CompletedIntake | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadIntake = async () => {
      try {
        const response = await fetch(`/api/completed-intakes/${intakeId}`)
        if (!response.ok) {
          throw new Error('Failed to load intake')
        }
        const data = await response.json()
        setIntake(data)
      } catch (error) {
        console.error('Error loading intake:', error)
      } finally {
        setLoading(false)
      }
    }

    if (intakeId) {
      loadIntake()
    }
  }, [intakeId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-medium">Loading estimation details...</div>
      </div>
    )
  }

  if (!intake) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-medium text-destructive">Failed to load estimation details</div>
      </div>
    )
  }

  // Calculate work units by team
  const workUnitsByTeam = intake.template.nodes.reduce((acc: Record<string, { hours: number, items: any[] }>, node: any) => {
    if (node.work_units && intake.answers[node.id] === 'Yes') {
      node.work_units.forEach((wu: any) => {
        if (!acc[wu.team_id]) {
          acc[wu.team_id] = { hours: 0, items: [] }
        }
        acc[wu.team_id].hours += wu.hours
        acc[wu.team_id].items.push({
          ...wu,
          question: node.content
        })
      })
    }
    return acc
  }, {})

  const totalHours = Object.values(workUnitsByTeam).reduce(
    (sum, team) => sum + team.hours,
    0
  )

  return (
    <div className="container mx-auto py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Estimation Submitted Successfully!</h1>
        <p className="text-muted-foreground">
          Your estimation has been recorded. Here's a summary of your submission:
        </p>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Template Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Template Name</p>
                  <p className="font-medium">{intake.template.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Date</p>
                  <p className="font-medium">
                    {new Date(intake.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Work Breakdown by Team</h3>
              <div className="space-y-4">
                {Object.entries(workUnitsByTeam).map(([teamId, data]) => (
                  <div key={teamId} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Team {teamId}</h4>
                      <p className="text-sm font-medium">{data.hours} hours</p>
                    </div>
                    <div className="space-y-2">
                      {data.items.map((item, index) => (
                        <div key={index} className="text-sm text-muted-foreground pl-4 border-l">
                          <p className="truncate">{item.question}</p>
                          <p className="text-sm font-medium">{item.hours} hours</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total Estimated Hours</p>
                <p className="text-lg font-bold text-primary">{totalHours} hours</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 