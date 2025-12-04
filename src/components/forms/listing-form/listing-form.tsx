'use client'

import { useState } from 'react'
import { useForm, FormProvider, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listingSchema, type ListingFormData } from '@/types/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { StepBasics } from './step-basics'
import { StepLocation } from './step-location'
import { StepDetails } from './step-details'
import { StepFeatures } from './step-features'
import { StepPhotos } from './step-photos'
import { StepPricing } from './step-pricing'
import { createListing, updateListing } from '@/app/actions/listings'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STEPS = [
  { id: 'basics', title: 'Basics' },
  { id: 'location', title: 'Location' },
  { id: 'details', title: 'Details' },
  { id: 'features', title: 'Features' },
  { id: 'photos', title: 'Photos' },
  { id: 'pricing', title: 'Pricing' },
]

interface ListingFormProps {
  initialData?: ListingFormData & { id?: string }
}

export function ListingForm({ initialData }: ListingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  
  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as Resolver<ListingFormData>,
    defaultValues: initialData || {
      title: '',
      propertyType: 'SINGLE_FAMILY',
      listingType: 'FOR_SALE',
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
      features: [],
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
        fieldsToValidate = ['title', 'propertyType', 'listingType']
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
      case 4: // Photos
        // Photos are optional, no required validation
        break
      case 5: // Pricing
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
    try {
      let result;
      if (initialData?.id) {
        result = await updateListing(initialData.id, data)
      } else {
        result = await createListing(data)
      }
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(initialData?.id ? 'Listing updated!' : 'Listing created!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto py-8">
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
              {currentStep === 4 && <StepPhotos />}
              {currentStep === 5 && <StepPricing />}
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
                <Button type="submit" disabled={isSubmitting}>
                  {initialData?.id ? 'Update Listing' : 'Create Listing'}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </FormProvider>
  )
}
