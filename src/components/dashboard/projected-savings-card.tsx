'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface ProjectedSavingsCardProps {
  amount: number
}

export function ProjectedSavingsCard({ amount }: ProjectedSavingsCardProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <Card className="relative overflow-hidden border-0 bg-card p-0 card-hover">
      {/* Teal accent bar on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />

      <div className="p-5 pl-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Projected Savings
              </p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-foreground">
              {formattedAmount}
            </p>
          </div>

          {/* Optional trend indicator */}
          <div className="hidden sm:flex items-center gap-1 text-primary text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>+12%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
