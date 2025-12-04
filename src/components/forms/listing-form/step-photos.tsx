import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ListingFormData } from '@/types/listing'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function StepPhotos() {
  const { control, watch, setValue } = useFormContext<ListingFormData>()
  const photos = watch('photos') || []
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setValue('photos', [...photos, data.url])
        toast.success('Photo uploaded')
      } else {
        toast.error('Upload failed')
      }
    } catch (error) {
      toast.error('Upload error')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setValue('photos', photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Property Photos</FormLabel>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading}>
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </div>
      </div>
      
      <FormDescription>
        Upload photos of your property. Supported formats: JPG, PNG.
      </FormDescription>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border">
            <img 
              src={photo} 
              alt={`Property photo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <Button 
              type="button" 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removePhoto(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {photos.length === 0 && (
          <div className="col-span-full text-center p-8 border-2 border-dashed rounded-lg text-gray-400">
            No photos added yet. Click "Upload Photo" to start.
          </div>
        )}
      </div>
    </div>
  )
}
