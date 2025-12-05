'use client'

import { Card } from '@/components/ui/card'

interface ViewsData {
  label: string
  value: number
  color: string
}

interface ViewsReportCardProps {
  data?: ViewsData[]
}

const defaultData: ViewsData[] = [
  { label: 'MLS', value: 0, color: '#00D9A5' },
  { label: 'Realtor.com', value: 0, color: '#3B82F6' },
  { label: 'Redfin', value: 0, color: '#8B5CF6' },
  { label: 'Zillow', value: 0, color: '#F59E0B' },
]

export function ViewsReportCard({ data = defaultData }: ViewsReportCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Calculate pie chart segments
  let cumulativePercent = 0
  const segments = data.map((item) => {
    const percent = (item.value / total) * 100
    const startAngle = cumulativePercent * 3.6 // 360 / 100
    cumulativePercent += percent
    const endAngle = cumulativePercent * 3.6

    return {
      ...item,
      percent,
      startAngle,
      endAngle,
    }
  })

  // Generate SVG path for pie segment
  const getArcPath = (startAngle: number, endAngle: number, radius: number = 60) => {
    const centerX = 70
    const centerY = 70

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <Card className="border-0 bg-card p-5 card-hover">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        Views Report:
      </p>

      <div className="flex items-center gap-4">
        {/* Pie Chart */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={getArcPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx="70" cy="70" r="35" className="fill-card" />
            {/* Total in center */}
            <text
              x="70"
              y="65"
              textAnchor="middle"
              className="fill-foreground text-lg font-bold"
              style={{ fontSize: '18px' }}
            >
              {total}
            </text>
            <text
              x="70"
              y="82"
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
              style={{ fontSize: '10px' }}
            >
              Total Views
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-0">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground truncate">
                {item.label}
              </span>
              <span className="text-sm font-medium text-foreground ml-auto">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
