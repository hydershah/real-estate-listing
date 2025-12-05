'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function ChatWidget() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Need Help?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          Our team is here to help you with your listing.
        </p>
        <Button className="w-full" variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with us
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">HubSpot chat coming soon</p>
      </CardContent>
    </Card>
  )
}
