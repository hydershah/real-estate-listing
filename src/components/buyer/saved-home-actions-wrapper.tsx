'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RequestTourDialog } from './request-tour-dialog'
import { SubmitOfferDialog } from './submit-offer-dialog'
import { Button } from '@/components/ui/button'
import { Calendar, FileText } from 'lucide-react'

interface SavedHomeActionsWrapperProps {
  savedHomeId: string
  address: string
  listingPrice: number | null
  canRequestTour: boolean
  canSubmitOffer: boolean
}

export function SavedHomeActionsWrapper({
  savedHomeId,
  address,
  listingPrice,
  canRequestTour,
  canSubmitOffer,
}: SavedHomeActionsWrapperProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tourDialogOpen, setTourDialogOpen] = useState(false)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)

  // Handle URL params to auto-open dialogs
  useEffect(() => {
    const action = searchParams.get('action')

    if (action === 'tour' && canRequestTour) {
      setTourDialogOpen(true)
      // Clear the URL param
      router.replace(`/buyer/saved-homes/${savedHomeId}`, { scroll: false })
    } else if (action === 'offer' && canSubmitOffer) {
      setOfferDialogOpen(true)
      // Clear the URL param
      router.replace(`/buyer/saved-homes/${savedHomeId}`, { scroll: false })
    }
  }, [searchParams, canRequestTour, canSubmitOffer, savedHomeId, router])

  return (
    <div className="flex items-center gap-2">
      {canRequestTour && (
        <RequestTourDialog
          savedHomeId={savedHomeId}
          address={address}
          open={tourDialogOpen}
          onOpenChange={setTourDialogOpen}
        >
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Request Tour
          </Button>
        </RequestTourDialog>
      )}
      {canSubmitOffer && (
        <SubmitOfferDialog
          savedHomeId={savedHomeId}
          address={address}
          listingPrice={listingPrice}
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
        >
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Submit Offer
          </Button>
        </SubmitOfferDialog>
      )}
    </div>
  )
}
