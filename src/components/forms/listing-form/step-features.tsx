import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { ListingFormData } from '@/types/listing'

const FEATURES = [
  { id: 'ac', label: 'Central AC' },
  { id: 'pool', label: 'Pool' },
  { id: 'fireplace', label: 'Fireplace' },
  { id: 'hardwood', label: 'Hardwood Floors' },
  { id: 'kitchen', label: 'Updated Kitchen' },
  { id: 'laundry', label: 'Washer/Dryer' },
  { id: 'basement', label: 'Basement' },
  { id: 'patio', label: 'Deck/Patio' },
  { id: 'fenced', label: 'Fenced Yard' },
  { id: 'other', label: "Other Features (we'll confirm with you)" },
]

export function StepFeatures() {
  const { control } = useFormContext<ListingFormData>()

  return (
    <div className="space-y-4">
      <FormLabel>Features & Amenities</FormLabel>
      <div className="grid grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <FormField
            key={feature.id}
            control={control}
            name="features"
            render={({ field }) => {
              return (
                <FormItem
                  key={feature.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(feature.id)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...field.value, feature.id])
                          : field.onChange(
                              field.value?.filter(
                                (value) => value !== feature.id
                              )
                            )
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {feature.label}
                  </FormLabel>
                </FormItem>
              )
            }}
          />
        ))}
      </div>
    </div>
  )
}
