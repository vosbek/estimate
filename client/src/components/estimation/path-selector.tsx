'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface EstimationPathSelectorProps {
  id: number
  title: string
  description: string
  complexity: string
  duration: string
  teams: string[]
}

export function EstimationPathSelector({
  id,
  title,
  description,
  complexity,
  duration,
  teams
}: EstimationPathSelectorProps) {
  return (
    <Link href={`/estimate/template/${id}`}>
      <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-b from-background/50 to-background hover:from-accent hover:to-accent/80 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground/90">{title}</h3>
            <Badge variant="outline" className="text-xs bg-background/50">
              {complexity}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Estimated Duration</span>
            <span className="font-medium">{duration}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {teams.map((team) => (
              <Badge key={team} variant="outline" className="text-[10px] bg-background/50">
                {team}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
} 