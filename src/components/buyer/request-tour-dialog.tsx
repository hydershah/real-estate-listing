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
import { Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { requestTour } from '@/app/actions/buyer'
import { tourRequestSchema, type TourRequestFormData } from '@/types/buyer'

interface RequestTourDialogProps {
  savedHomeId: string
  address: string
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function RequestTourDialog({
  savedHomeId,
  address,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: RequestTourDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const form = useForm<TourRequestFormData>({
    resolver: zodResolver(tourRequestSchema),
    defaultValues: {
      savedHomeId,
      requestedDate: '',
      availability: '',
      notes: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting }, reset } = form

  const onSubmit = async (data: TourRequestFormData) => {
    try {
      const result = await requestTour(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Tour requested! The ListClose team will contact you soon.')
      setOpen(false)
      reset()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Request a Tour
          </DialogTitle>
          <DialogDescription>
            Request a tour for <span className="font-medium">{address}</span>.
            Our team will coordinate the details with you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requestedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Select your preferred tour date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Weekdays after 5pm, weekends anytime..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Let us know your general availability
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or questions..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Requesting...' : 'Request Tour'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
