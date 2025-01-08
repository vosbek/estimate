'use client'

import { notFound } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

interface WorkUnit {
  id: number
  team_id: string
  hours: number
  question?: string
}

interface TeamWorkData {
  hours: number
  items: WorkUnit[]
}

export default function EstimatePage({ params }: PageProps) {
  const router = useRouter()
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      const { id } = await params
      const response = await fetch(`/api/templates/${id}`)
      if (!response.ok) {
        notFound()
      }
      const data = await response.json()
      setTemplate(data)
      setLoading(false)
    }
    loadTemplate()
  }, [params])

  if (loading || !template) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium">Loading Template...</h3>
          <Progress value={33} className="w-[200px]" />
        </div>
      </div>
    )
  }

  const currentNode = template.nodes[currentNodeIndex]
  if (!currentNode) {
    return <div>No questions found in this template.</div>
  }

  const progress = ((currentNodeIndex + 1) / template.nodes.length) * 100
  const isLastQuestion = currentNodeIndex === template.nodes.length - 1

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentNode.id]: answer
    }))

    if (!isLastQuestion) {
      setCurrentNodeIndex(prev => prev + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handleBackToQuestions = () => {
    setShowSummary(false)
    setCurrentNodeIndex(template.nodes.length - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/completed-intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: template.id,
          answers
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit estimation')
      }

      const data = await response.json()
      router.push(`/estimate/success?id=${data.id}`)
    } catch (error) {
      console.error('Error submitting estimation:', error)
      alert('Failed to submit estimation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (showSummary) {
    // Calculate totals
    const workUnitsByTeam = template.nodes.reduce((acc: Record<string, TeamWorkData>, node: any) => {
      if (node.work_units && answers[node.id] === 'Yes') {
        node.work_units.forEach((wu: WorkUnit) => {
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

    const totalHours = (Object.values(workUnitsByTeam) as TeamWorkData[]).reduce(
      (sum, team) => sum + team.hours, 
      0
    )

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-3">
          <Card className="p-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  Summary of Your Responses
                </h2>
                <p className="text-muted-foreground">
                  Please review your answers and work estimates before submitting
                </p>
              </div>

              {/* Questions Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Questions & Answers</h3>
                <div className="space-y-4">
                  {template.nodes.map((node: any) => (
                    <div key={node.id} className="p-4 rounded-lg border bg-muted/50">
                      <div className="space-y-2">
                        <h4 className="font-medium">{node.content}</h4>
                        <p className="text-sm text-primary">
                          Answer: <span className="font-medium">{answers[node.id]}</span>
                        </p>
                        {node.answers?.find((a: any) => a.text === answers[node.id])?.work_units?.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Associated Work:</p>
                            <div className="space-y-1">
                              {node.answers.find((a: any) => a.text === answers[node.id]).work_units.map((wu: any) => (
                                <p key={wu.id} className="text-sm">
                                  • Team {wu.team_id}: {wu.hours} hours
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Units Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Work Breakdown by Team</h3>
                <div className="space-y-6">
                  {(Object.entries(workUnitsByTeam) as [string, TeamWorkData][]).map(([teamId, data]) => (
                    <div key={teamId} className="p-4 rounded-lg border">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Team {teamId}</h4>
                          <p className="text-sm font-medium">{data.hours} hours</p>
                        </div>
                        <div className="space-y-2">
                          {data.items.map((item: WorkUnit, index: number) => (
                            <div key={index} className="text-sm text-muted-foreground pl-4 border-l">
                              <p className="truncate">{item.question}</p>
                              <p className="text-sm font-medium">{item.hours} hours</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={handleBackToQuestions}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Questions
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Responses'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Estimation Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-medium">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                    <p className="font-medium">{template.nodes.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="font-medium text-primary">{totalHours} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teams Involved</p>
                    <p className="font-medium">{Object.keys(workUnitsByTeam).length.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-primary">Ready to Submit</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} className="mt-2" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {/* Main question area */}
      <div className="lg:col-span-3">
        <Card className="relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0">
            <Progress value={progress} className="rounded-none" />
          </div>

          <div className="p-8 pt-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  {template.name}
                </h2>
                <p className="text-muted-foreground">
                  Question {currentNodeIndex + 1} of {template.nodes.length}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{currentNode.content}</h3>
                    <div className="grid gap-2">
                      {currentNode.node_type === 'decision' && currentNode.answers && (
                        <>
                          {currentNode.answers.map((answer: any) => (
                            <Button
                              key={answer.text}
                              variant={answers[currentNode.id] === answer.text ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => handleAnswer(answer.text)}
                            >
                              {answer.text}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>

      {/* Running total sidebar */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Your Selections</h3>
              <div className="space-y-2">
                {template.nodes.map((node: any, index: number) => {
                  const answer = answers[node.id]
                  const isCurrent = index === currentNodeIndex
                  return (
                    <div 
                      key={node.id}
                      className={`p-3 rounded-lg border ${
                        isCurrent ? 'bg-accent border-accent' : 
                        answer ? 'bg-muted border-transparent' : 
                        'border-dashed'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          answer ? 'bg-primary text-primary-foreground' : 
                          'bg-muted-foreground/20'
                        }`}>
                          {answer && <Check className="w-3 h-3" />}
                          {!answer && <span className="text-xs text-muted-foreground">{index + 1}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate">{node.content}</p>
                          {answer && (
                            <p className="text-sm text-muted-foreground">
                              {answer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="mt-2" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 