'use client'

import { Card } from '@/components/ui/card'
import { Home, Clock } from 'lucide-react'

interface ActiveListingsCardProps {
  activeCount: number
  pendingCount: number
}

export function ActiveListingsCard({ activeCount, pendingCount }: ActiveListingsCardProps) {
  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        Active Listings:
      </p>

      <div className="flex items-center gap-6">
        {/* Active Count */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-border" />

        {/* Pending Count */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10">
            <Clock className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <p className="text-3xl font-bold text-chart-4">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
