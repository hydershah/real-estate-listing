'use client'

import { Card } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface ScheduledShowingsCardProps {
  count: number
}

export function ScheduledShowingsCard({ count }: ScheduledShowingsCardProps) {
  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
          <Calendar className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Scheduled Showings
          </p>
          <p className="text-3xl font-bold text-foreground">{count}</p>
        </div>
      </div>
    </Card>
  )
}
