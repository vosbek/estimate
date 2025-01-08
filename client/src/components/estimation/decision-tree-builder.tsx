import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DecisionNode {
  id: string
  type: 'question' | 'work-unit'
  content: string
  options?: Array<{
    text: string
    nextNodeId: string | null
  }>
  workUnit?: {
    team: string
    name: string
    hours: number
  }
}

interface Props {
  onChange?: (nodes: DecisionNode[]) => void
}

export function DecisionTreeBuilder({ onChange }: Props) {
  const [nodes, setNodes] = useState<DecisionNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [parentQuestionId, setParentQuestionId] = useState<string | null>(null)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)

  const addQuestion = () => {
    const newNode: DecisionNode = {
      id: `q-${Date.now()}`,
      type: 'question',
      content: '',
      options: [
        { text: '', nextNodeId: null },
        { text: '', nextNodeId: null }
      ]
    }
    const updatedNodes = [...nodes, newNode]
    setNodes(updatedNodes)
    setSelectedNode(newNode.id)
    
    // If there's a parent question and option selected, automatically connect them
    if (parentQuestionId && selectedOptionIndex !== null) {
      const updatedNodesWithConnection = updatedNodes.map(node => {
        if (node.id === parentQuestionId && node.type === 'question' && node.options) {
          const newOptions = [...node.options]
          newOptions[selectedOptionIndex] = {
            ...newOptions[selectedOptionIndex],
            nextNodeId: newNode.id
          }
          return { ...node, options: newOptions }
        }
        return node
      })
      setNodes(updatedNodesWithConnection)
      onChange?.(updatedNodesWithConnection)
    } else {
      onChange?.(updatedNodes)
    }
  }

  const addWorkUnit = () => {
    const newNode: DecisionNode = {
      id: `w-${Date.now()}`,
      type: 'work-unit',
      content: '',
      workUnit: {
        team: '',
        name: '',
        hours: 0
      }
    }
    const updatedNodes = [...nodes, newNode]
    setNodes(updatedNodes)
    setSelectedNode(newNode.id)
    
    // If there's a parent question and option selected, automatically connect them
    if (parentQuestionId && selectedOptionIndex !== null) {
      const updatedNodesWithConnection = updatedNodes.map(node => {
        if (node.id === parentQuestionId && node.type === 'question' && node.options) {
          const newOptions = [...node.options]
          newOptions[selectedOptionIndex] = {
            ...newOptions[selectedOptionIndex],
            nextNodeId: newNode.id
          }
          return { ...node, options: newOptions }
        }
        return node
      })
      setNodes(updatedNodesWithConnection)
      onChange?.(updatedNodesWithConnection)
    } else {
      onChange?.(updatedNodes)
    }
  }

  const updateNode = (nodeId: string, updates: Partial<DecisionNode>) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    )
    setNodes(updatedNodes)
    onChange?.(updatedNodes)
  }

  const addOption = (nodeId: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === 'question') {
        return {
          ...node,
          options: [...(node.options || []), { text: '', nextNodeId: null }]
        }
      }
      return node
    })
    setNodes(updatedNodes)
    onChange?.(updatedNodes)
  }

  const removeOption = (nodeId: string, optionIndex: number) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === 'question' && node.options) {
        return {
          ...node,
          options: node.options.filter((_, index) => index !== optionIndex)
        }
      }
      return node
    })
    setNodes(updatedNodes)
    onChange?.(updatedNodes)
  }

  const removeNode = (nodeId: string) => {
    // First, remove any references to this node from other nodes' options
    const updatedNodes = nodes.map(node => {
      if (node.type === 'question' && node.options) {
        return {
          ...node,
          options: node.options.map(option => ({
            ...option,
            nextNodeId: option.nextNodeId === nodeId ? null : option.nextNodeId
          }))
        }
      }
      return node
    }).filter(node => node.id !== nodeId)

    setNodes(updatedNodes)
    setSelectedNode(null)
    onChange?.(updatedNodes)
  }

  // Get available nodes for linking (excluding the current node and any nodes that would create a cycle)
  const getAvailableNodes = (currentNodeId: string) => {
    const visited = new Set<string>()
    
    const checkForCycle = (nodeId: string): boolean => {
      if (visited.has(nodeId)) return true
      visited.add(nodeId)
      
      const node = nodes.find(n => n.id === nodeId)
      if (!node?.options) return false
      
      return node.options.some(option => 
        option.nextNodeId && checkForCycle(option.nextNodeId)
      )
    }

    return nodes.filter(node => {
      if (node.id === currentNodeId) return false
      visited.clear()
      visited.add(currentNodeId)
      return !checkForCycle(node.id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => {
          setParentQuestionId(selectedNode)
          setSelectedOptionIndex(null)
          addQuestion()
        }} variant="outline" size="sm">
          Add Question
        </Button>
        <Button onClick={() => {
          setParentQuestionId(selectedNode)
          setSelectedOptionIndex(null)
          addWorkUnit()
        }} variant="outline" size="sm">
          Add Work Unit
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Node List */}
        <div className="space-y-4">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedNode === node.id ? 'border-primary' : ''
              }`}
              onClick={() => {
                setSelectedNode(node.id)
                setParentQuestionId(null)
                setSelectedOptionIndex(null)
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {node.type === 'question' ? 'Question' : 'Work Unit'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {node.content || 'No content yet'}
                  </div>
                  {node.type === 'question' && node.options && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Leads to:</div>
                      {node.options.map((option, index) => {
                        const targetNode = nodes.find(n => n.id === option.nextNodeId)
                        return (
                          <div key={index} className="flex items-center gap-1">
                            <div className="w-[60px] truncate">{option.text || 'Option ' + (index + 1)}:</div>
                            {targetNode ? (
                              <span className="text-primary">
                                {targetNode.type === 'question' ? 'Q: ' : 'W: '}
                                {targetNode.content || 'Unnamed node'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No connection</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {node.type === 'work-unit' && node.workUnit && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">{node.workUnit.team}</span>
                      <span className="text-muted-foreground ml-2">({node.workUnit.hours} hours)</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNode(node.id)
                  }}
                >
                  <span className="sr-only">Remove node</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Node Editor */}
        {selectedNode && (
          <Card className="p-4">
            <div className="space-y-4">
              {nodes.find(n => n.id === selectedNode)?.type === 'question' ? (
                <>
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={nodes.find(n => n.id === selectedNode)?.content || ''}
                      onChange={(e) => updateNode(selectedNode, { content: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Options</Label>
                    {nodes.find(n => n.id === selectedNode)?.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const updatedNodes = nodes.map(node => {
                                if (node.id === selectedNode && node.options) {
                                  const newOptions = [...node.options]
                                  newOptions[index] = {
                                    ...newOptions[index],
                                    text: e.target.value
                                  }
                                  return { ...node, options: newOptions }
                                }
                                return node
                              })
                              setNodes(updatedNodes)
                              onChange?.(updatedNodes)
                            }}
                            placeholder="Option text"
                          />
                        </div>
                        <div className="w-[180px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setParentQuestionId(selectedNode)
                              setSelectedOptionIndex(index)
                            }}
                          >
                            Add Follow-up
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(selectedNode, index)}
                          disabled={nodes.find(n => n.id === selectedNode)?.options?.length === 1}
                        >
                          <span className="sr-only">Remove option</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(selectedNode)}
                    >
                      Add Option
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Work Unit Name</Label>
                    <Input
                      value={nodes.find(n => n.id === selectedNode)?.content || ''}
                      onChange={(e) => updateNode(selectedNode, { content: e.target.value })}
                      placeholder="Enter work unit name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Team</Label>
                    <Select
                      value={nodes.find(n => n.id === selectedNode)?.workUnit?.team || ''}
                      onValueChange={(value) => {
                        const node = nodes.find(n => n.id === selectedNode)
                        if (node && node.workUnit) {
                          updateNode(selectedNode, {
                            workUnit: { ...node.workUnit, team: value }
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business-analysis">Business Analysis</SelectItem>
                        <SelectItem value="insurance-config">Insurance Configuration</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="frontend">Frontend Development</SelectItem>
                        <SelectItem value="backend">Backend Development</SelectItem>
                        <SelectItem value="qa">Quality Assurance</SelectItem>
                        <SelectItem value="compliance">Compliance & Legal</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      value={nodes.find(n => n.id === selectedNode)?.workUnit?.hours || 0}
                      onChange={(e) => {
                        const node = nodes.find(n => n.id === selectedNode)
                        if (node && node.workUnit) {
                          updateNode(selectedNode, {
                            workUnit: { ...node.workUnit, hours: parseInt(e.target.value) || 0 }
                          })
                        }
                      }}
                      placeholder="Enter estimated hours"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 