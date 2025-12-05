'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Bath, Square, MapPin, Eye, Edit, Trash2 } from 'lucide-react'
import { Listing } from '@prisma/client'
import { deleteListing } from '@/app/actions/listings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Serialized listing type with Decimal fields converted to numbers
type SerializedListing = Omit<Listing, 'price' | 'bathrooms' | 'hoaFee' | 'taxAmount' | 'lotSize'> & {
  price: number
  bathrooms: number
  hoaFee: number | null
  taxAmount: number | null
  lotSize: number | null
}

interface PropertyCardProps {
  listing: SerializedListing
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    const result = await deleteListing(listing.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Listing deleted successfully')
      router.refresh()
    }
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(listing.price))

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-primary text-primary-foreground',
    PENDING_REVIEW: 'bg-chart-4 text-white',
    PENDING_SALE: 'bg-chart-2 text-white',
    SOLD: 'bg-chart-3 text-white',
    DRAFT: 'bg-muted text-muted-foreground',
    EXPIRED: 'bg-destructive text-white',
  }

  const hasPhoto = listing.photos && listing.photos.length > 0

  return (
    <Card className="group overflow-hidden border-0 bg-card card-hover">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasPhoto ? (
          <Image
            src={listing.photos[0]}
            alt={listing.address}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Status Badge */}
        <Badge className={`absolute top-3 left-3 ${statusColors[listing.status] || statusColors.DRAFT}`}>
          {listing.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
        </Badge>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/listings/${listing.id}`}>
            <Button size="sm" variant="secondary" className="h-9">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
          <Link href={`/listings/${listing.id}/edit`}>
            <Button size="sm" variant="secondary" className="h-9">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <p className="text-xl font-bold text-primary mb-1">{formattedPrice}</p>

        {/* Address */}
        <h3 className="font-semibold text-foreground truncate mb-2">
          {listing.address}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{listing.city}, {listing.state}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{listing.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{listing.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{listing.squareFeet.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {listing.propertyType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

// Placeholder icon for when no image
function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
