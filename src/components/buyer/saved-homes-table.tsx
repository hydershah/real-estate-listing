'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Eye, Pencil, Trash2, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSavedHome } from '@/app/actions/buyer'
import type { SerializedSavedHome } from '@/types/buyer'

interface SavedHomesTableProps {
  savedHomes: SerializedSavedHome[]
}

const statusColors: Record<string, string> = {
  SAVED: 'bg-muted text-muted-foreground',
  TOURING: 'bg-chart-2 text-white',
  OFFER_SUBMITTED: 'bg-chart-3 text-white',
}

const statusLabels: Record<string, string> = {
  SAVED: 'Saved',
  TOURING: 'Touring',
  OFFER_SUBMITTED: 'Offer Submitted',
}

export function SavedHomesTable({ savedHomes }: SavedHomesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [homeToDelete, setHomeToDelete] = useState<SerializedSavedHome | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!homeToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteSavedHome(homeToDelete.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Saved home removed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setHomeToDelete(null)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatLocation = (home: SerializedSavedHome) => {
    const parts = [home.city, home.state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '—'
  }

  if (savedHomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No saved homes found
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {savedHomes.map((home) => (
              <TableRow key={home.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <Link
                    href={`/buyer/saved-homes/${home.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {home.address}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLocation(home)}
                </TableCell>
                <TableCell>{formatPrice(home.price)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {home.bedrooms !== null && home.bathrooms !== null ? (
                    <span>
                      {home.bedrooms} bd, {home.bathrooms} ba
                      {home.squareFeet && `, ${home.squareFeet.toLocaleString()} sqft`}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[home.status]}>
                    {statusLabels[home.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/buyer/saved-homes/${home.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/buyer/saved-homes/${home.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {home.status === 'SAVED' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/buyer/saved-homes/${home.id}?action=tour`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Request Tour
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/buyer/saved-homes/${home.id}?action=offer`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Submit Offer
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setHomeToDelete(home)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Saved Home</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{homeToDelete?.address}&quot; from your saved
              homes? This will also delete any associated tours and offers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
