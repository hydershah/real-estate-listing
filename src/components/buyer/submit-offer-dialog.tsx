'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileText, AlertCircle, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createOffer, requestOfferSupport } from '@/app/actions/buyer'
import { offerSchema, type OfferFormData } from '@/types/buyer'

interface SubmitOfferDialogProps {
  savedHomeId: string
  address: string
  listingPrice: number | null
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SubmitOfferDialog({
  savedHomeId,
  address,
  listingPrice,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SubmitOfferDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isRequestingSupport, setIsRequestingSupport] = useState(false)

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<OfferFormData | null>(null)

  const form = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      savedHomeId,
      amount: listingPrice || undefined,
      notes: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting }, reset, watch } = form
  const offerAmountRaw = watch('amount')
  const offerAmount = typeof offerAmountRaw === 'number' ? offerAmountRaw : null

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const onSubmit = async (data: unknown) => {
    setPendingData(data as OfferFormData)
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingData) return

    try {
      const result = await createOffer(pendingData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Offer submitted! The ListClose team will follow up with you.')
      setOpen(false)
      setShowConfirm(false)
      setPendingData(null)
      reset()
    } catch {
      toast.error('Something went wrong')
    }
  }

  // Calculate estimated rebate (1%)
  const estimatedRebate = offerAmount ? offerAmount * 0.01 : 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setShowConfirm(false)
        setPendingData(null)
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!showConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submit an Offer
              </DialogTitle>
              <DialogDescription>
                Submit an offer for <span className="font-medium">{address}</span>.
                {listingPrice && (
                  <span className="block mt-1">
                    Listing price: {formatPrice(listingPrice)}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            min="1"
                            placeholder="450000"
                            className="pl-7"
                            value={(field.value as number | undefined) ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? undefined : Number(value))
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {offerAmount && offerAmount > 0 && (
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Estimated rebate at closing:
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {formatPrice(estimatedRebate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      *Based on 1% buyer rebate. Actual amount may vary.
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional terms or notes..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The ListClose team will help prepare your formal offer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      setIsRequestingSupport(true)
                      try {
                        const result = await requestOfferSupport(savedHomeId, address)
                        if (result.error) {
                          toast.error(result.error)
                        } else {
                          toast.success('Support request sent! Our team will contact you soon.')
                          setOpen(false)
                        }
                      } catch {
                        toast.error('Something went wrong')
                      } finally {
                        setIsRequestingSupport(false)
                      }
                    }}
                    disabled={isSubmitting || isRequestingSupport}
                    className="sm:mr-auto"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {isRequestingSupport ? 'Requesting...' : 'Request Offer Support'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting || isRequestingSupport}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isRequestingSupport}>
                      Review Offer
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-chart-4" />
                Confirm Your Offer
              </DialogTitle>
              <DialogDescription>
                Please review your offer details before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer Amount</span>
                  <span className="font-bold text-lg">{formatPrice(pendingData?.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Rebate</span>
                  <span className="font-medium text-primary">{formatPrice(estimatedRebate)}</span>
                </div>
              </div>

              {pendingData?.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{pendingData.notes}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                By submitting this offer, you authorize ListClose to prepare and present
                a formal offer on your behalf. This is not a binding contract.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
