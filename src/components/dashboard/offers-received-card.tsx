'use client'

import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface OffersReceivedCardProps {
  count: number
}

export function OffersReceivedCard({ count }: OffersReceivedCardProps) {
  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
          <FileText className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Offers Received
          </p>
          <p className="text-3xl font-bold text-foreground">{count}</p>
        </div>
      </div>
    </Card>
  )
}
