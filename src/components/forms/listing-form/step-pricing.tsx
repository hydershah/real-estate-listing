import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ListingFormData } from '@/types/listing'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const SMART_SELLER_FEATURES = [
  'Pro photos and MLS syndication to Zillow, Redfin, Realtor.com, and more',
  'Seller dashboard and showings app',
  'Price updates and offer strategy',
  'Docs and contract help',
  'Premium yard sign',
]

const FULL_SERVICE_FEATURES = [
  'Everything in Smart Seller',
  'Dedicated in-person agent',
  'Open houses and home video marketing',
  'Buyer communication handled for you',
  'End-to-end transaction management',
]

export function StepPricing() {
  const { control, watch, setValue } = useFormContext<ListingFormData>()
  const selectedPackage = watch('listingPackage')
  const price = watch('price') || 0

  // Calculate savings
  const traditionalRate = 0.03
  const lcRate = selectedPackage === 'SMART_SELLER' ? 0.01 : 0.02
  const dollarSaved = (traditionalRate - lcRate) * Number(price)
  const percentSaved = ((traditionalRate - lcRate) / traditionalRate) * 100

  return (
    <div className="space-y-6">
      {/* Price Input */}
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Listing Price</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="1" placeholder="500000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* HOA Fee */}
      <FormField
        control={control}
        name="hoaFee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly HOA Fee ($) If Applicable</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Package Selection */}
      <FormField
        control={control}
        name="listingPackage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Your Package</FormLabel>
            <FormDescription>
              Choose the service level that&apos;s right for you
            </FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Smart Seller Package */}
                <div
                  onClick={() => setValue('listingPackage', 'SMART_SELLER')}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                    field.value === 'SMART_SELLER'
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  )}
                >
                  {field.value === 'SMART_SELLER' && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg">Smart Seller</h3>
                    <p className="text-sm text-gray-500">
                      <span className="line-through text-gray-400">3%</span>{' '}
                      <span className="text-primary font-bold">1% at close</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    A cost-effective way to sell your home with expert virtual guidance.
                    Designed for sellers who want control with expert support.
                  </p>
                  <ul className="space-y-2">
                    {SMART_SELLER_FEATURES.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full-Service Agent Package */}
                <div
                  onClick={() => setValue('listingPackage', 'FULL_SERVICE_AGENT')}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                    field.value === 'FULL_SERVICE_AGENT'
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  )}
                >
                  {field.value === 'FULL_SERVICE_AGENT' && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg">Full-Service Agent</h3>
                    <p className="text-sm text-gray-500">
                      <span className="line-through text-gray-400">3%</span>{' '}
                      <span className="text-primary font-bold">2% at close</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    High-touch, in-person real estate service with modern efficiency.
                    Traditional service, modern pricing.
                  </p>
                  <ul className="space-y-2">
                    {FULL_SERVICE_FEATURES.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Projected Savings */}
      {price > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Your Projected Savings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-600">Amount Saved</p>
              <p className="text-xl font-bold text-green-800">
                ${dollarSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-green-600">Percent Saved vs Traditional</p>
              <p className="text-xl font-bold text-green-800">
                {percentSaved.toFixed(0)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Compared to traditional 3% seller agent commission
          </p>
        </div>
      )}
    </div>
  )
}
