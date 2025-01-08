'use client'

import { useState } from 'react'
import { TemplatePreview } from '@/components/estimation/template-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

// Mock work units data - this should come from your API/database
const mockWorkUnits = [
  {
    id: 'wu1',
    name: 'Basic Configuration',
    team: 'Insurance Configuration',
    hours: 8
  },
  {
    id: 'wu2',
    name: 'Complex Configuration',
    team: 'Insurance Configuration',
    hours: 16
  },
  {
    id: 'wu3',
    name: 'Integration Setup',
    team: 'Integration',
    hours: 24
  },
  {
    id: 'wu4',
    name: 'UI Development',
    team: 'Frontend',
    hours: 16
  },
  {
    id: 'wu5',
    name: 'API Development',
    team: 'Backend',
    hours: 24
  },
  {
    id: 'wu6',
    name: 'Testing & QA',
    team: 'QA',
    hours: 16
  },
  {
    id: 'wu7',
    name: 'Documentation',
    team: 'Documentation',
    hours: 8
  },
  {
    id: 'wu8',
    name: 'Compliance Review',
    team: 'Compliance',
    hours: 16
  }
]

interface DecisionNode {
  id: string
  type: 'decision' | 'leaf'
  content: string
  position?: { x: number; y: number }
  answers?: Array<{
    text: string
    nextNodeId: string | null
    workUnitId?: string
  }>
}

interface TemplateDetails {
  name: string
  description: string
  complexity: 'Low' | 'Medium' | 'High'
  estimatedDuration: string
}

export default function NewTemplate() {
  const router = useRouter()
  const [nodes, setNodes] = useState<DecisionNode[]>([])
  const [details, setDetails] = useState<TemplateDetails>({
    name: '',
    description: '',
    complexity: 'Medium',
    estimatedDuration: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleNodesChange = (updatedNodes: DecisionNode[]) => {
    console.log('Nodes updated:', updatedNodes)
    setNodes(updatedNodes)
  }

  const handleSave = async () => {
    if (!details.name) {
      alert('Please enter a template name')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...details,
          nodes,
          teams: Array.from(new Set(mockWorkUnits.map(wu => wu.team))),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      const data = await response.json()
      router.push('/admin/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Template</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/templates')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Complexity</label>
            <Select
              value={details.complexity}
              onValueChange={(value) => setDetails({ ...details, complexity: value as 'Low' | 'Medium' | 'High' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Duration</label>
            <Input
              value={details.estimatedDuration}
              onChange={(e) => setDetails({ ...details, estimatedDuration: e.target.value })}
              placeholder="e.g., 2-3 weeks"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={details.description}
              onChange={(e) => setDetails({ ...details, description: e.target.value })}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </div>
      </Card>

      <TemplatePreview
        nodes={nodes}
        workUnits={mockWorkUnits}
        onChange={handleNodesChange}
      />
    </div>
  )
} 