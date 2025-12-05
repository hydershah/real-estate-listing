'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'

const PLATFORMS = [
  { name: 'MLS', views: '--' },
  { name: 'Realtor.com', views: '--' },
  { name: 'Redfin', views: '--' },
  { name: 'Zillow', views: '--' },
]

export function ViewsReport() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Views Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PLATFORMS.map((platform) => (
            <div key={platform.name} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{platform.name}</span>
              <span className="font-medium">{platform.views} views</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Coming soon</p>
      </CardContent>
    </Card>
  )
}
