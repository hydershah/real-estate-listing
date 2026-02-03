'use client'

import { Card } from '@/components/ui/card'
import { FileText, Send, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'

interface ActiveOffersCardProps {
  draftCount: number
  submittedCount: number
  counteredCount: number
  acceptedCount: number
  rejectedCount: number
}

export function ActiveOffersCard({
  draftCount,
  submittedCount,
  counteredCount,
  acceptedCount,
  rejectedCount,
}: ActiveOffersCardProps) {
  const activeCount = submittedCount + counteredCount

  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Offers</p>
        <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-chart-3" />
        </div>
      </div>

      <p className="text-3xl font-bold text-foreground mb-4">{activeCount}</p>
      <p className="text-xs text-muted-foreground mb-3">Active offers</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Send className="h-3.5 w-3.5 text-chart-2" />
            <span className="text-muted-foreground">Submitted</span>
          </div>
          <span className="font-medium">{submittedCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-chart-4" />
            <span className="text-muted-foreground">Countered</span>
          </div>
          <span className="font-medium">{counteredCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Accepted</span>
          </div>
          <span className="font-medium">{acceptedCount}</span>
        </div>
      </div>
    </Card>
  )
}
