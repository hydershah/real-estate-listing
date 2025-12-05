import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListingFormData } from '@/types/listing'

export function StepBasics() {
  const { control } = useFormContext<ListingFormData>()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                <SelectItem value="CONDO">Condo</SelectItem>
                <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
