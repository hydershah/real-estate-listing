import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ListingForm } from "@/components/forms/listing-form/listing-form"

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
  })

  if (!listing) notFound()

  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Transform listing data to match form schema if needed
  // Prisma Decimal to number, null to undefined
  const initialData = {
    id: listing.id,
    title: listing.title ?? undefined,
    description: listing.description ?? undefined,
    propertyType: listing.propertyType,
    listingType: listing.listingType,
    listingPackage: listing.listingPackage,
    status: listing.status,
    address: listing.address,
    unitNumber: listing.unitNumber ?? undefined,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    bedrooms: listing.bedrooms,
    bathrooms: Number(listing.bathrooms),
    squareFeet: listing.squareFeet,
    lotSize: listing.lotSize ? Number(listing.lotSize) : undefined,
    yearBuilt: listing.yearBuilt ?? undefined,
    price: Number(listing.price),
    hoaFee: listing.hoaFee ? Number(listing.hoaFee) : undefined,
    taxAmount: listing.taxAmount ? Number(listing.taxAmount) : undefined,
    features: (listing.features as string[]) || [],
    photos: listing.photos || [],
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Listing</h1>
      <ListingForm initialData={initialData} />
    </div>
  )
}
