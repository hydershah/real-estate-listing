'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createSavedHome, updateSavedHome } from '@/app/actions/buyer'
import { savedHomeSchema, type SavedHomeFormData, type SerializedSavedHome } from '@/types/buyer'
import { MapPin, DollarSign, Home, Link as LinkIcon } from 'lucide-react'

interface SavedHomeFormProps {
  initialData?: SerializedSavedHome | null
}

export function SavedHomeForm({ initialData }: SavedHomeFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm({
    resolver: zodResolver(savedHomeSchema),
    defaultValues: {
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zipCode: initialData?.zipCode || '',
      price: initialData?.price || undefined,
      bedrooms: initialData?.bedrooms || undefined,
      bathrooms: initialData?.bathrooms || undefined,
      squareFeet: initialData?.squareFeet || undefined,
      listingUrl: initialData?.listingUrl || '',
      notes: initialData?.notes || '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, formState: { isSubmitting } } = form

  const onSubmit = async (data: unknown) => {
    try {
      const formData = data as SavedHomeFormData
      const result = isEditing
        ? await updateSavedHome(initialData.id, formData)
        : await createSavedHome(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? 'Home updated!' : 'Home saved!')
      router.push('/buyer')
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Houston" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="TX" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="77001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5 text-primary" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="3"
                        {...field}
                        value={(field.value as number | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="2"
                        {...field}
                        value={(field.value as number | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squareFeet"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Square Feet</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="2000"
                        {...field}
                        value={(field.value as number | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="450000"
                        className="pl-7"
                        {...field}
                        value={(field.value as number | undefined) ?? ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-5 w-5 text-primary" />
              Additional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="listingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://zillow.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste a link to the listing for your reference (optional)
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why you're interested in this property..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Saving...'
              : isEditing
              ? 'Update Home'
              : 'Save Home'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
