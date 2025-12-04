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
  // Prisma Decimal to number, etc.
  const initialData = {
    ...listing,
    id: listing.id,
    price: Number(listing.price),
    bathrooms: Number(listing.bathrooms),
    lotSize: listing.lotSize ? Number(listing.lotSize) : undefined,
    hoaFee: listing.hoaFee ? Number(listing.hoaFee) : undefined,
    taxAmount: listing.taxAmount ? Number(listing.taxAmount) : undefined,
    features: listing.features as string[],
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Listing</h1>
      <ListingForm initialData={initialData} />
    </div>
  )
}
