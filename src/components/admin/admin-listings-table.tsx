'use client'

import { Listing, User } from '@prisma/client'
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

type ListingWithUser = Listing & { user: User }

interface AdminListingsTableProps {
  listings: ListingWithUser[]
}

export function AdminListingsTable({ listings }: AdminListingsTableProps) {
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
            <TableHead>Title</TableHead>
            <TableHead>User</TableHead>
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
              <TableCell colSpan={7} className="text-center h-24">
                No listings found.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {listing.user.email}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    listing.status === 'SOLD' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {listing.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </TableCell>
                <TableCell>${Number(listing.price).toLocaleString()}</TableCell>
                <TableCell>{listing.propertyType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
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
