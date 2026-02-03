'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

interface UpcomingToursCardProps {
  requestedCount: number
  scheduledCount: number
  completedCount: number
}

export function UpcomingToursCard({
  requestedCount,
  scheduledCount,
  completedCount,
}: UpcomingToursCardProps) {
  const activeCount = requestedCount + scheduledCount

  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Tours</p>
        <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-chart-2" />
        </div>
      </div>

      <p className="text-3xl font-bold text-foreground mb-4">{activeCount}</p>
      <p className="text-xs text-muted-foreground mb-3">Active tours</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-chart-4" />
            <span className="text-muted-foreground">Requested</span>
          </div>
          <span className="font-medium">{requestedCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-chart-2" />
            <span className="text-muted-foreground">Scheduled</span>
          </div>
          <span className="font-medium">{scheduledCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <span className="font-medium">{completedCount}</span>
        </div>
      </div>
    </Card>
  )
}
