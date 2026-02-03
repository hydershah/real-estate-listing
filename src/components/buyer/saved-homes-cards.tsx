'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  MapPin,
  Bed,
  Bath,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteSavedHome } from '@/app/actions/buyer'
import type { SerializedSavedHome } from '@/types/buyer'

interface SavedHomesCardsProps {
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

export function SavedHomesCards({ savedHomes }: SavedHomesCardsProps) {
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
    if (!price) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatLocation = (home: SerializedSavedHome) => {
    const parts = [home.city, home.state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedHomes.map((home) => (
          <Card key={home.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 bg-card">
            <CardContent className="p-0">
              {/* Card Header with Status and Actions */}
              <div className="flex items-center justify-between p-4 pb-2">
                <Badge className={statusColors[home.status]}>
                  {statusLabels[home.status]}
                </Badge>
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
              </div>

              {/* Main Content */}
              <Link href={`/buyer/saved-homes/${home.id}`} className="block p-4 pt-0">
                {/* Address */}
                <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">
                  {home.address}
                </h3>

                {/* Location */}
                {formatLocation(home) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {formatLocation(home)}
                  </p>
                )}

                {/* Price */}
                {formatPrice(home.price) && (
                  <div className="flex items-center gap-1 mt-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(home.price)}
                    </span>
                  </div>
                )}

                {/* Beds/Baths */}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {home.bedrooms !== null && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {home.bedrooms} {home.bedrooms === 1 ? 'bed' : 'beds'}
                    </span>
                  )}
                  {home.bathrooms !== null && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {home.bathrooms} {home.bathrooms === 1 ? 'bath' : 'baths'}
                    </span>
                  )}
                  {home.squareFeet && (
                    <span>{home.squareFeet.toLocaleString()} sqft</span>
                  )}
                </div>

                {/* Notes preview */}
                {home.notes && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 italic">
                    &ldquo;{home.notes}&rdquo;
                  </p>
                )}
              </Link>
            </CardContent>
          </Card>
        ))}
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
