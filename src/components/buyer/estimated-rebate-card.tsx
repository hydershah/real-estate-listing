'use client'

import { Card } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

interface EstimatedRebateCardProps {
  amount: number
}

export function EstimatedRebateCard({ amount }: EstimatedRebateCardProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <Card className="border-0 bg-card p-5 card-hover relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Estimated Rebate
          </p>
          <p className="text-3xl font-bold text-foreground">
            {formattedAmount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Based on submitted offers
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 italic">
        *Estimate only. Actual rebate may vary based on final sale price and terms.
      </p>
    </Card>
  )
}
