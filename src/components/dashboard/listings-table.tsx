'use client'

import { Listing } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Eye, Home, Bed, Bath, Ruler } from "lucide-react"
import Link from "next/link"
import { deleteListing } from "@/app/actions/listings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ListingsTableProps {
  listings: Listing[]
}

export function ListingsTable({ listings }: ListingsTableProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    const result = await deleteListing(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Listing deleted successfully")
      router.refresh()
    }
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No listings found. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Photo */}
              <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 flex items-center justify-center">
                {listing.photos && listing.photos.length > 0 ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title || listing.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Home className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Property Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {listing.title || listing.address}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        listing.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ${Number(listing.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> {listing.bedrooms} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" /> {Number(listing.bathrooms)} baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" /> {listing.squareFeet.toLocaleString()} sqft
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/listings/${listing.id}/edit`} className="flex-1 md:flex-none">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-1 md:flex-none"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
