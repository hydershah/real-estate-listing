import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { user: true }
  })

  if (!listing) {
    notFound()
  }

  // Users can only view their own listings, admins can view all
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-10">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {/* Photos Placeholder */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            {listing.photos.length > 0 ? (
              <img src={listing.photos[0]} alt={listing.title ?? "Property"} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-muted-foreground">No photos</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {listing.photos.slice(1).map((photo, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-xl text-muted-foreground">${Number(listing.price).toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              listing.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {listing.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="font-bold">{listing.bedrooms}</div>
              <div className="text-xs text-muted-foreground">Beds</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{Number(listing.bathrooms)}</div>
              <div className="text-xs text-muted-foreground">Baths</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{listing.squareFeet}</div>
              <div className="text-xs text-muted-foreground">Sq Ft</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p>{listing.address}</p>
              <p>{listing.city}, {listing.state} {listing.zipCode}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {(listing.features as string[])?.map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                    {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
