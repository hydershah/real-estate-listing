'use client'

import { Card } from '@/components/ui/card'
import { Heart, Eye, FileText } from 'lucide-react'

interface SavedHomesCountCardProps {
  savedCount: number
  touringCount: number
  offerCount: number
}

export function SavedHomesCountCard({
  savedCount,
  touringCount,
  offerCount,
}: SavedHomesCountCardProps) {
  const totalCount = savedCount + touringCount + offerCount

  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Saved Homes</p>
        <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
          <Heart className="h-5 w-5 text-chart-1" />
        </div>
      </div>

      <p className="text-3xl font-bold text-foreground mb-4">{totalCount}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Saved</span>
          </div>
          <span className="font-medium">{savedCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-chart-2" />
            <span className="text-muted-foreground">Touring</span>
          </div>
          <span className="font-medium">{touringCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-chart-3" />
            <span className="text-muted-foreground">Offer Submitted</span>
          </div>
          <span className="font-medium">{offerCount}</span>
        </div>
      </div>
    </Card>
  )
}
