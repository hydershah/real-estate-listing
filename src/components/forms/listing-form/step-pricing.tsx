'use client'

import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ListingFormData } from '@/types/listing'
import { Check } from 'lucide-react'

const PACKAGES = [
  {
    id: 'SMART_SELLER',
    name: 'Smart Seller',
    rate: '1% at close',
    description: 'A cost-effective way to sell your home with expert virtual guidance. Designed for sellers who want control with expert support - save thousands in commissions.',
    features: [
      'Pro photos and MLS syndication to Zillow, Redfin, Realtor.com, and more',
      'Seller dashboard and showings app',
      'Price updates and offer strategy',
      'Docs and contract help',
      'Premium yard sign',
    ],
  },
  {
    id: 'FULL_SERVICE_AGENT',
    name: 'Full-Service Agent',
    rate: '2% at close',
    description: 'High-touch, in-person real estate service with modern efficiency. For sellers who want an expert to handle everything - traditional service, modern pricing.',
    features: [
      'Everything in Smart Seller',
      'Dedicated in-person agent',
      'Open houses and home video marketing',
      'Buyer communication handled for you',
      'End-to-end transaction management',
    ],
  },
]

export function StepPricing() {
  const { control, watch, setValue } = useFormContext<ListingFormData>()
  const selectedPackage = watch('listingPackage')

  return (
    <div className="space-y-6">
      {/* Estimated Listing Price */}
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Listing Price</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="1" placeholder="Enter estimated price" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Listing Package Selection */}
      <div className="space-y-4 pt-4">
        <FormLabel className="text-base">Choose Your Listing Package</FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-5 cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setValue('listingPackage', pkg.id as 'SMART_SELLER' | 'FULL_SERVICE_AGENT')}
            >
              <div className="flex items-start gap-3 mb-3">
                {/* Checkbox circle */}
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  selectedPackage === pkg.id
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/50'
                }`}>
                  {selectedPackage === pkg.id && (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  <p className="text-primary font-medium">{pkg.rate}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {pkg.description}
              </p>

              <ul className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <FormField
          control={control}
          name="listingPackage"
          render={() => <FormMessage />}
        />
      </div>
    </div>
  )
}
