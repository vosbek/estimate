import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowRight, ZoomIn, ZoomOut, Workflow, Save, Undo, Redo, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Answer {
  text: string
  nextNodeId: string | null
  workUnitId?: string
}

interface DecisionNode {
  id: string
  type: 'decision' | 'leaf'
  content: string
  position?: { x: number; y: number }
  answers?: Answer[]
  workUnitId?: string
}

interface WorkUnit {
  id: string
  name: string
  team: string
  hours: number
}

interface Props {
  nodes: DecisionNode[]
  workUnits: WorkUnit[]
  onChange?: (nodes: DecisionNode[]) => void
}

function CompactNode({
  node,
  isSelected,
  onClick,
  onDelete,
  workUnits,
}: {
  node: DecisionNode
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  workUnits: WorkUnit[]
}) {
  // Get all work units assigned to this node's answers
  const nodeWorkUnits = (node.answers || [])
    .map(answer => {
      if (!answer.workUnitId) return null
      const unit = workUnits.find(w => w.id === answer.workUnitId)
      return unit ? { ...unit, answerText: answer.text } : null
    })
    .filter((w): w is (WorkUnit & { answerText: string }) => w !== null)

  const totalHours = nodeWorkUnits.reduce((sum, unit) => sum + unit.hours, 0)
  const hasWorkUnits = nodeWorkUnits.length > 0

  return (
    <Card 
      className={`w-[75px] cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all relative
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${hasWorkUnits ? 'ring-1 ring-destructive' : ''}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 absolute -top-2 -right-2 bg-background border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="p-2 text-center" onClick={onClick}>
        <div className="text-xs font-medium truncate">
          {node.content || 'Decision'}
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {node.type === 'decision' && node.answers && (
            <div className="text-[10px] text-muted-foreground">
              {node.answers.length} options
            </div>
          )}
          {hasWorkUnits && (
            <div className="text-[10px] flex flex-col gap-0.5">
              {nodeWorkUnits.map((unit, i) => (
                <div key={i} className="flex items-center justify-between bg-destructive/10 rounded px-1">
                  <span className="truncate text-destructive-foreground/70">{unit.answerText}</span>
                  <span className="text-destructive font-medium">{unit.hours}h</span>
                </div>
              ))}
              {nodeWorkUnits.length > 1 && (
                <div className="text-destructive font-medium border-t border-destructive/20 pt-0.5 mt-0.5">
                  Total: {totalHours}h
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function ExpandedNodeDialog({
  node,
  workUnits,
  onContentChange,
  onAddAnswer,
  onRemoveAnswer,
  onAnswerTextChange,
  onConnectClick,
  onSelectWorkUnit,
  onClose,
}: {
  node: DecisionNode
  workUnits: WorkUnit[]
  onContentChange: (content: string) => void
  onAddAnswer: () => void
  onRemoveAnswer: (index: number) => void
  onAnswerTextChange: (index: number, text: string) => void
  onConnectClick: (index: number) => void
  onSelectWorkUnit: (index: number, workUnitId: string) => void
  onClose: () => void
}) {
  const answers = node.type === 'decision' ? (node.answers || []) : []

  // Add debug logging for initial state
  React.useEffect(() => {
    console.log('Dialog mounted with node:', node)
    console.log('Available work units:', workUnits)
  }, [node, workUnits])

  // Close dialog when clicking outside
  const dialogRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div ref={dialogRef} className="relative">
        <Card className="w-[300px]">
          <div className="p-2 border-b">
            <Input
              value={node.content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Enter your question"
              className="text-sm font-medium border-0 bg-transparent px-0 h-auto focus:ring-0"
            />
          </div>
          <div className="p-2 space-y-2">
            {answers.map((answer, index) => {
              const workUnit = answer.workUnitId ? workUnits.find(w => w.id === answer.workUnitId) : null
              console.log(`Rendering answer ${index}:`, { answer, workUnit })
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="flex-1">
                      <Input
                        value={answer.text}
                        onChange={(e) => onAnswerTextChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="bg-muted h-8 text-sm"
                      />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onConnectClick(index)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Connect to next decision</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {answers.length > 2 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onRemoveAnswer(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove option</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      className="w-full bg-muted h-8 text-sm rounded-md border border-input px-3"
                      value={answer.workUnitId || "none"}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('SELECT CHANGE EVENT:', value);
                        onSelectWorkUnit(index, value === "none" ? "" : value);
                      }}
                    >
                      <option value="none">Select work unit</option>
                      {workUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.team} - {unit.hours}h)
                        </option>
                      ))}
                    </select>
                  </div>
                  {workUnit && (
                    <div className="text-xs bg-destructive/10 p-1 rounded flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Workflow className="h-3 w-3 text-destructive" />
                        <span className="font-medium">{workUnit.name}</span>
                      </div>
                      <span className="text-destructive font-medium">
                        {workUnit.hours}h
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
            {node.type === 'decision' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onAddAnswer}
              >
                Add Option <Plus className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function WorkUnitsSummary({ nodes, workUnits }: { nodes: DecisionNode[], workUnits: WorkUnit[] }) {
  // Collect all selected work units from nodes
  const selectedWorkUnits = nodes.flatMap(node => 
    (node.answers || [])
      .map(answer => answer.workUnitId)
      .filter((id): id is string => id !== undefined)
      .map(id => workUnits.find(w => w.id === id))
      .filter((w): w is WorkUnit => w !== undefined)
  )

  // Group by team and calculate totals
  const teamTotals = selectedWorkUnits.reduce((acc, unit) => {
    if (!acc[unit.team]) {
      acc[unit.team] = {
        hours: 0,
        units: []
      }
    }
    acc[unit.team].hours += unit.hours
    acc[unit.team].units.push(unit)
    return acc
  }, {} as Record<string, { hours: number, units: WorkUnit[] }>)

  const totalHours = Object.values(teamTotals).reduce((sum, team) => sum + team.hours, 0)

  return (
    <div className="w-48 border-l p-1 flex flex-col h-full">
      <div className="font-medium mb-1 flex items-center justify-between text-sm">
        <span>Work Units</span>
        <span className="text-muted-foreground">
          {totalHours}h
        </span>
      </div>
      
      <div className="space-y-2 overflow-auto flex-1">
        {Object.entries(teamTotals).map(([team, data]) => (
          <div key={team} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{team}</span>
              <span className="text-muted-foreground">{data.hours}h</span>
            </div>
            <div className="space-y-1">
              {data.units.map((unit, i) => (
                <div 
                  key={`${unit.id}-${i}`} 
                  className="text-[10px] bg-muted/50 p-1 rounded flex items-center justify-between"
                >
                  <span>{unit.name}</span>
                  <span className="text-muted-foreground">{unit.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(teamTotals).length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-4">
          No work units selected
        </div>
      )}
    </div>
  )
}

export function TemplatePreview({ nodes, workUnits, onChange }: Props) {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null)
  const [expandedNode, setExpandedNode] = React.useState<string | null>(null)
  const [zoom, setZoom] = React.useState(1)
  const [viewportPosition, setViewportPosition] = React.useState({ x: 0, y: 0 })
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(Math.min(Math.max(0.1, zoom + delta), 2))
    } else {
      setViewportPosition({
        x: viewportPosition.x - e.deltaX,
        y: viewportPosition.y - e.deltaY
      })
    }
  }

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [zoom, viewportPosition])

  const handleNodeDrag = (nodeId: string, position: { x: number; y: number }) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, position } : node
    )
    onChange?.(updatedNodes)
  }

  const handleAddNode = (type: 'decision' | 'leaf') => {
    const newNode: DecisionNode = {
      id: `${type}-${Date.now()}`,
      type,
      content: '',
      position: { x: 50, y: 200 },
      ...(type === 'decision' ? {
        answers: [
          { text: 'Yes', nextNodeId: null },
          { text: 'No', nextNodeId: null }
        ]
      } : {})
    }
    onChange?.([...nodes, newNode])
    setSelectedNode(newNode.id)
  }

  // Helper function to get all descendants of a node
  const getDescendants = (nodeId: string): string[] => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node?.answers) return []
    
    const childIds = node.answers
      .map(a => a.nextNodeId)
      .filter((id): id is string => id !== null)
    
    return [...childIds, ...childIds.flatMap(id => getDescendants(id))]
  }

  const handleDeleteNode = (nodeId: string) => {
    // First, find all nodes that connect to this node
    const parentNodes = nodes.filter(n => 
      n.answers?.some(a => a.nextNodeId === nodeId)
    )

    // Update parent nodes to remove connections
    let updatedNodes = nodes.map(node => {
      if (node.answers?.some(a => a.nextNodeId === nodeId)) {
        return {
          ...node,
          answers: node.answers.map(a => 
            a.nextNodeId === nodeId ? { ...a, nextNodeId: null } : a
          )
        }
      }
      return node
    })

    // Remove the node and all its descendants
    const nodesToRemove = new Set([nodeId, ...getDescendants(nodeId)])
    updatedNodes = updatedNodes.filter(node => !nodesToRemove.has(node.id))

    onChange?.(updatedNodes)
    if (selectedNode === nodeId) setSelectedNode(null)
    if (expandedNode === nodeId) setExpandedNode(null)
  }

  const handleConnectClick = (nodeId: string, answerIndex: number) => {
    const sourceNode = nodes.find(n => n.id === nodeId)
    if (!sourceNode?.position) return

    // First, check if this answer already has a connection
    if (sourceNode.answers?.[answerIndex].nextNodeId) {
      // If it does, just expand that node
      setExpandedNode(sourceNode.answers[answerIndex].nextNodeId)
      return
    }

    const VERTICAL_SPACING = 100
    const HORIZONTAL_SPACING = 200
    
    // Calculate the starting Y position based on the specific answer's position
    const answerY = sourceNode.position.y + (answerIndex * 30) + 10

    // Find any existing nodes at the target X position to avoid overlaps
    const targetX = sourceNode.position.x + HORIZONTAL_SPACING
    const existingNodesAtX = nodes.filter(n => 
      n.position && 
      Math.abs(n.position.x - targetX) < 50 &&
      // Only consider nodes that are connected to this source node
      sourceNode.answers?.some(answer => answer.nextNodeId === n.id)
    )

    // Start from the answer's Y position and find a free spot
    let targetY = answerY
    let attempts = 0
    const checkOverlap = (y: number) => 
      existingNodesAtX.some(n => 
        n.position && 
        Math.abs(n.position.y - y) < VERTICAL_SPACING
      )

    // Keep adjusting Y position until we find a free spot
    while (checkOverlap(targetY) && attempts < 100) {
      if (attempts % 2 === 0) {
        targetY += VERTICAL_SPACING
      } else {
        targetY -= VERTICAL_SPACING * 2
      }
      attempts++
    }

    const newNode = {
      id: `decision-${Date.now()}`,
      type: 'decision' as const,
      content: '',
      position: {
        x: targetX,
        y: targetY
      },
      answers: [
        { text: 'Yes', nextNodeId: null },
        { text: 'No', nextNodeId: null }
      ]
    }

    // Only update the specific answer's connection
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === 'decision' && node.answers) {
        const newAnswers = [...node.answers]
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          nextNodeId: newNode.id
        }
        return { ...node, answers: newAnswers }
      }
      return node
    })

    onChange?.([...updatedNodes, newNode])
    setSelectedNode(newNode.id)
    setExpandedNode(newNode.id)
  }

  const renderConnections = () => {
    const connections: React.ReactNode[] = []

    nodes.forEach(node => {
      if (node.type === 'decision' && node.answers) {
        node.answers.forEach((answer, index) => {
          if (answer.nextNodeId) {
            const targetNode = nodes.find(n => n.id === answer.nextNodeId)
            if (targetNode && node.position && targetNode.position) {
              // Start from the specific answer's position
              const startX = node.position.x + 75
              const startY = node.position.y + (index * 30) + 10 // Base position + offset per answer
              const endX = targetNode.position.x
              const endY = targetNode.position.y + 20 // Center of target node

              // Calculate control points for smoother curves
              const distance = Math.abs(endY - startY)
              const controlDistance = Math.min(80, distance * 0.5)
              
              const path = `M ${startX} ${startY} 
                          C ${startX + controlDistance} ${startY},
                            ${endX - controlDistance} ${endY},
                            ${endX} ${endY}`
              
              connections.push(
                <g key={`${node.id}-${answer.nextNodeId}-${index}`}>
                  <path
                    d={path}
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    fill="none"
                    className="opacity-70"
                  />
                  <circle cx={startX} cy={startY} r="2" fill="hsl(var(--primary))" />
                  <circle cx={endX} cy={endY} r="2" fill="hsl(var(--primary))" />
                  
                  <foreignObject
                    x={(startX + endX) / 2 - 25}
                    y={(startY + endY) / 2 - 10}
                    width="50"
                    height="20"
                  >
                    <div className="flex items-center justify-center">
                      <span className="px-1.5 py-0.5 rounded-full bg-background text-[10px] font-medium border shadow-sm">
                        {answer.text}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              )
            }
          }
        })
      }
    })

    return connections
  }

  const reorganizeNodes = () => {
    const HORIZONTAL_SPACING = 200
    const VERTICAL_SPACING = 100

    // Find root nodes (nodes that aren't connected to by any other node)
    const isRoot = (nodeId: string) => !nodes.some(n => 
      n.answers?.some(a => a.nextNodeId === nodeId)
    )
    const rootNodes = nodes.filter(n => isRoot(n.id))

    // Helper function to get all descendants of a node
    const getDescendants = (nodeId: string): string[] => {
      const node = nodes.find(n => n.id === nodeId)
      if (!node?.answers) return []
      
      const childIds = node.answers
        .map(a => a.nextNodeId)
        .filter((id): id is string => id !== null)
      
      return [...childIds, ...childIds.flatMap(id => getDescendants(id))]
    }

    // Helper function to get node's depth in the tree
    const getNodeDepth = (nodeId: string): number => {
      const parentNode = nodes.find(n => 
        n.answers?.some(a => a.nextNodeId === nodeId)
      )
      if (!parentNode) return 0
      return 1 + getNodeDepth(parentNode.id)
    }

    // Calculate new positions
    const updatedNodes = nodes.map(node => {
      if (isRoot(node.id)) {
        // Position root nodes at the start
        const rootIndex = rootNodes.findIndex(n => n.id === node.id)
        return {
          ...node,
          position: { x: 50, y: rootIndex * VERTICAL_SPACING * 2 }
        }
      }

      // Position based on depth and parent's position
      const depth = getNodeDepth(node.id)
      const parentNode = nodes.find(n => 
        n.answers?.some(a => a.nextNodeId === node.id)
      )
      
      if (!parentNode?.position) return node

      // Find which answer this node is connected to
      const answerIndex = parentNode.answers?.findIndex(a => a.nextNodeId === node.id) || 0
      const siblingCount = parentNode.answers?.filter(a => a.nextNodeId !== null).length || 1
      
      // Calculate vertical position based on parent's position and answer index
      const verticalOffset = (answerIndex - (siblingCount - 1) / 2) * VERTICAL_SPACING
      
      return {
        ...node,
        position: {
          x: 50 + (depth * HORIZONTAL_SPACING),
          y: parentNode.position.y + verticalOffset
        }
      }
    })

    onChange?.(updatedNodes)
  }

  const handleSelectWorkUnit = (nodeId: string, answerIndex: number, workUnitId: string) => {
    console.log('=== WORK UNIT SELECTION HANDLER ===')
    console.log('NodeId:', nodeId)
    console.log('AnswerIndex:', answerIndex)
    console.log('WorkUnitId:', workUnitId)
    
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === 'decision' && node.answers) {
        console.log('Found matching node:', node)
        const newAnswers = [...node.answers]
        if (answerIndex >= 0 && answerIndex < newAnswers.length) {
          newAnswers[answerIndex] = {
            ...newAnswers[answerIndex],
            workUnitId: workUnitId || undefined
          }
          console.log('Updated answer:', newAnswers[answerIndex])
          return { ...node, answers: newAnswers }
        }
      }
      return node
    })
    
    console.log('Final updated nodes:', updatedNodes)
    onChange?.(updatedNodes)
  }

  return (
    <div className="flex h-[calc(100vh-1rem)] gap-1">
      {/* Minimal Sidebar */}
      <div className="w-32 flex flex-col gap-1 p-1 border-r">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => handleAddNode('decision')}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Node
        </Button>

        <div className="space-y-1 mt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-center flex-1">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={reorganizeNodes}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-muted/30 rounded-lg overflow-hidden">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAddNode('decision')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Decision
            </Button>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="w-full h-full overflow-auto"
          >
            <div
              style={{
                transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '5000px',
                height: '3000px',
                position: 'relative'
              }}
            >
              <svg 
                className="absolute inset-0" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                {renderConnections()}
              </svg>

              <div className="relative" style={{ zIndex: 2 }}>
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      handleNodeDrag(node.id, {
                        x: (node.position?.x || 0) + info.offset.x,
                        y: (node.position?.y || 0) + info.offset.y
                      })
                    }}
                    initial={false}
                    style={{
                      position: 'absolute',
                      left: node.position?.x || 0,
                      top: node.position?.y || 0,
                      touchAction: 'none'
                    }}
                  >
                    <CompactNode
                      node={node}
                      workUnits={workUnits}
                      isSelected={selectedNode === node.id}
                      onClick={() => {
                        setSelectedNode(node.id)
                        setExpandedNode(node.id)
                      }}
                      onDelete={() => handleDeleteNode(node.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expanded Node Dialog */}
        {expandedNode && (
          <ExpandedNodeDialog
            node={nodes.find(n => n.id === expandedNode)!}
            workUnits={workUnits}
            onContentChange={(content) => {
              console.log('Content change:', content)
              const updatedNodes = nodes.map(n =>
                n.id === expandedNode ? { ...n, content } : n
              )
              onChange?.(updatedNodes)
            }}
            onAddAnswer={() => {
              console.log('Adding answer')
              const updatedNodes = nodes.map(n => {
                if (n.id === expandedNode && n.type === 'decision') {
                  return {
                    ...n,
                    answers: [...(n.answers || []), { text: 'New Option', nextNodeId: null }]
                  }
                }
                return n
              })
              onChange?.(updatedNodes)
            }}
            onRemoveAnswer={(index) => {
              console.log('Removing answer at index:', index)
              const updatedNodes = nodes.map(n => {
                if (n.id === expandedNode && n.type === 'decision' && n.answers) {
                  return {
                    ...n,
                    answers: n.answers.filter((_, i) => i !== index)
                  }
                }
                return n
              })
              onChange?.(updatedNodes)
            }}
            onAnswerTextChange={(index, text) => {
              console.log('Answer text change:', { index, text })
              const updatedNodes = nodes.map(n => {
                if (n.id === expandedNode && n.type === 'decision' && n.answers) {
                  const newAnswers = [...n.answers]
                  newAnswers[index] = { ...newAnswers[index], text }
                  return { ...n, answers: newAnswers }
                }
                return n
              })
              onChange?.(updatedNodes)
            }}
            onConnectClick={(index) => {
              console.log('Connect click at index:', index)
              handleConnectClick(expandedNode, index)
            }}
            onSelectWorkUnit={(index, workUnitId) => {
              console.log('=== SELECT WORK UNIT CALLBACK ===')
              console.log('Index:', index)
              console.log('WorkUnitId:', workUnitId)
              handleSelectWorkUnit(expandedNode, index, workUnitId)
            }}
            onClose={() => setExpandedNode(null)}
          />
        )}
      </div>

      {/* Right Summary Panel */}
      <WorkUnitsSummary nodes={nodes} workUnits={workUnits} />
    </div>
  )
} 