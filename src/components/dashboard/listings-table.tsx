'use client'

import { Listing } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { deleteListing } from "@/app/actions/listings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type SerializedListing = Omit<Listing, 'price' | 'bathrooms' | 'hoaFee' | 'taxAmount' | 'lotSize'> & {
  price: number
  bathrooms: number
  hoaFee: number | null
  taxAmount: number | null
  lotSize: number | null
}

interface ListingsTableProps {
  listings: SerializedListing[]
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No listings found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.address}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                </TableCell>
                <TableCell>${Number(listing.price).toLocaleString()}</TableCell>
                <TableCell>{listing.propertyType.replace('_', ' ')}</TableCell>
                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/listings/${listing.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
