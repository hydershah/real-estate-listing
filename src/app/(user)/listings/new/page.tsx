import { ListingForm } from '@/components/forms/listing-form/listing-form'

export default function NewListingPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Create New Listing</h1>
      <ListingForm />
    </div>
  )
}
