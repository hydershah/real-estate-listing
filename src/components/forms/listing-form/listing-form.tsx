'use client'

import { useState } from 'react'
import { useForm, FormProvider, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listingSchema, type ListingFormData } from '@/types/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StepBasics } from './step-basics'
import { StepLocation } from './step-location'
import { StepDetails } from './step-details'
import { StepFeatures } from './step-features'
import { StepPricing } from './step-pricing'
import { createListing, updateListing } from '@/app/actions/listings'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Home, MapPin, Bed, Bath, Ruler, DollarSign, Calendar, Building, Tag, X } from 'lucide-react'

const STEPS = [
  { id: 'basics', title: 'Basics' },
  { id: 'location', title: 'Location' },
  { id: 'details', title: 'Details' },
  { id: 'features', title: 'Features' },
  { id: 'pricing', title: 'Pricing' },
]

interface ListingFormProps {
  initialData?: ListingFormData & { id?: string }
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  SINGLE_FAMILY: 'Single Family',
  CONDO: 'Condo',
  TOWNHOUSE: 'Townhouse',
  MULTI_FAMILY: 'Multi Family',
  APARTMENT: 'Apartment',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
  MOBILE: 'Mobile Home',
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  FOR_SALE: 'For Sale',
  FOR_RENT: 'For Rent',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ListingForm({ initialData }: ListingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingData, setPendingData] = useState<ListingFormData | null>(null)
  const router = useRouter()
  
  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as Resolver<ListingFormData>,
    defaultValues: initialData || {
      title: '',
      propertyType: 'SINGLE_FAMILY',
      listingType: 'FOR_SALE',
      listingPackage: undefined,
      address: '',
      unitNumber: '',
      city: '',
      state: '',
      zipCode: '',
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      lotSize: undefined,
      yearBuilt: undefined,
      features: ['other_features'],
      photos: [],
      description: '',
      price: 0,
      hoaFee: undefined,
      taxAmount: undefined,
    },
    mode: 'onChange',
  })

  const { trigger, handleSubmit, formState: { isSubmitting } } = methods

  const nextStep = async () => {
    // Validate current step fields before moving
    let fieldsToValidate: (keyof ListingFormData)[] = []
    
    switch (currentStep) {
      case 0: // Basics
        fieldsToValidate = ['propertyType']
        break
      case 1: // Location
        fieldsToValidate = ['address', 'city', 'state', 'zipCode']
        break
      case 2: // Details
        fieldsToValidate = ['bedrooms', 'bathrooms', 'squareFeet']
        break
      case 3: // Features
        // Features are optional, no required validation
        break
      case 4: // Pricing
        fieldsToValidate = ['price']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: ListingFormData) => {
    // Show confirmation dialog instead of directly submitting
    setPendingData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingData) return

    try {
      let result;
      if (initialData?.id) {
        result = await updateListing(initialData.id, pendingData)
      } else {
        result = await createListing(pendingData)
      }

      if (result.error) {
        toast.error(result.error)
        setShowConfirmDialog(false)
        return
      }
      toast.success(initialData?.id ? 'Listing updated!' : 'Listing created!')
      setShowConfirmDialog(false)
      router.push('/dashboard')
    } catch (error) {
      toast.error('Something went wrong')
      setShowConfirmDialog(false)
    }
  }

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false)
    setPendingData(null)
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto py-8">
        {/* Header with Exit Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{initialData?.id ? 'Edit Listing' : 'Create Listing'}</h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`text-sm font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && <StepBasics />}
              {currentStep === 1 && <StepLocation />}
              {currentStep === 2 && <StepDetails />}
              {currentStep === 3 && <StepFeatures />}
              {currentStep === 4 && <StepPricing />}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep === STEPS.length - 1 ? (
                <Button key="submit-btn" type="submit" disabled={isSubmitting}>
                  {initialData?.id ? 'Update Listing' : 'Save & Continue'}
                </Button>
              ) : (
                <Button key="next-btn" type="button" onClick={nextStep}>
                  Next
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                {initialData?.id ? 'Confirm Listing Update' : 'Confirm New Listing'}
              </DialogTitle>
              <DialogDescription>
                Please review your listing before submitting. You can make changes later on.
              </DialogDescription>
            </DialogHeader>

            {pendingData && (
              <div className="space-y-6 py-4">
                {/* Address & Type */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">{pendingData.address}, {pendingData.city}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Building className="h-3.5 w-3.5" />
                      {PROPERTY_TYPE_LABELS[pendingData.propertyType] || pendingData.propertyType}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      <Tag className="h-3.5 w-3.5" />
                      {LISTING_TYPE_LABELS[pendingData.listingType] || pendingData.listingType}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {pendingData.address}
                        {pendingData.unitNumber && `, Unit ${pendingData.unitNumber}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pendingData.city}, {pendingData.state} {pendingData.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">{pendingData.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">{pendingData.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">{pendingData.squareFeet.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Sq Ft</p>
                  </div>
                  {pendingData.yearBuilt && (
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold">{pendingData.yearBuilt}</p>
                      <p className="text-xs text-muted-foreground">Year Built</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Pricing</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(pendingData.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingData.listingType === 'FOR_RENT' ? 'per month' : 'listing price'}
                      </p>
                    </div>
                    {pendingData.hoaFee && (
                      <div>
                        <p className="text-lg font-semibold">{formatCurrency(pendingData.hoaFee)}</p>
                        <p className="text-xs text-muted-foreground">HOA / month</p>
                      </div>
                    )}
                    {pendingData.taxAmount && (
                      <div>
                        <p className="text-lg font-semibold">{formatCurrency(pendingData.taxAmount)}</p>
                        <p className="text-xs text-muted-foreground">Tax / year</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {pendingData.features && pendingData.features.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {pendingData.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-muted rounded text-sm"
                        >
                          {feature.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {pendingData.photos && pendingData.photos.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Photos ({pendingData.photos.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {pendingData.photos.slice(0, 4).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Property ${index + 1}`}
                          className="h-16 w-24 object-cover rounded border"
                        />
                      ))}
                      {pendingData.photos.length > 4 && (
                        <div className="h-16 w-24 rounded border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          +{pendingData.photos.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {pendingData.description && (
                  <div>
                    <p className="font-semibold mb-2">Description</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {pendingData.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
              >
                Go Back & Edit
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (initialData?.id ? 'Confirm Update' : 'Submit for Review')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Exit Confirmation Dialog */}
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Create Listing?</DialogTitle>
              <DialogDescription>
                Are you sure? Your progress will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExitDialog(false)}
              >
                Stay
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => router.push('/dashboard')}
              >
                Leave
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  )
}
