'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

interface SavingsWidgetProps {
  homePrice: number
  listingPackage: 'SMART_SELLER' | 'FULL_SERVICE_AGENT'
}

export function SavingsWidget({ homePrice, listingPackage }: SavingsWidgetProps) {
  const traditionalRate = 0.03
  const lcRate = listingPackage === 'SMART_SELLER' ? 0.01 : 0.02
  const dollarSaved = (traditionalRate - lcRate) * homePrice
  const percentSaved = ((traditionalRate - lcRate) / traditionalRate) * 100

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-800">
          <DollarSign className="w-4 h-4" />
          Projected Savings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-700">
          ${dollarSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <p className="text-xs text-green-600">
          {percentSaved.toFixed(0)}% saved vs traditional 3% commission
        </p>
      </CardContent>
    </Card>
  )
}
