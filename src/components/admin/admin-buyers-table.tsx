'use client'

import { Fragment, useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, ExternalLink, Pencil, Check, X as XIcon, Trash2, Ban } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  updateTourStatus, updateOfferStatus, cancelTour, withdrawOffer, deleteSavedHome,
} from "@/app/actions/buyer"
import type {
  SerializedAdminBuyer,
  TourStatus,
  OfferStatus,
} from "@/types/buyer"

interface AdminBuyersTableProps {
  buyers: SerializedAdminBuyer[]
}

const homeStatusColors: Record<string, string> = {
  SAVED: 'bg-muted text-muted-foreground',
  TOURING: 'bg-chart-2 text-white',
  OFFER_SUBMITTED: 'bg-chart-3 text-white',
}

const homeStatusLabels: Record<string, string> = {
  SAVED: 'Saved',
  TOURING: 'Touring',
  OFFER_SUBMITTED: 'Offer Submitted',
}

export function AdminBuyersTable({ buyers }: AdminBuyersTableProps) {
  const router = useRouter()
  const [expandedBuyers, setExpandedBuyers] = useState<Set<string>>(new Set())
  const [expandedHomes, setExpandedHomes] = useState<Set<string>>(new Set())

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Tour editing
  const [editingTourId, setEditingTourId] = useState<string | null>(null)
  const [tourEditData, setTourEditData] = useState({ scheduledDate: '', notes: '' })

  // Offer editing
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null)
  const [offerNotesEdit, setOfferNotesEdit] = useState('')

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deleteSavedHome' | 'cancelTour' | 'withdrawOffer'
    id: string
    label: string
  } | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  const toggleBuyer = (id: string) => {
    setExpandedBuyers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleHome = (id: string) => {
    setExpandedHomes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  // Filtered buyers
  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch = searchQuery === '' ||
      (buyer.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      buyer.email.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'has_active_tours') matchesStatus = buyer.activeTours > 0
    else if (statusFilter === 'has_active_offers') matchesStatus = buyer.activeOffers > 0
    else if (statusFilter === 'no_activity') matchesStatus = buyer.activeTours === 0 && buyer.activeOffers === 0

    return matchesSearch && matchesStatus
  })

  // Tour handlers
  const handleTourStatusChange = async (tourId: string, status: TourStatus) => {
    const extraData = editingTourId === tourId ? {
      scheduledDate: tourEditData.scheduledDate || undefined,
      notes: tourEditData.notes || undefined,
    } : {}

    const result = await updateTourStatus({ tourId, status, ...extraData })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Tour status updated')
      setEditingTourId(null)
      router.refresh()
    }
  }

  const handleSaveTourEdit = async (tourId: string, currentStatus: TourStatus) => {
    const result = await updateTourStatus({
      tourId,
      status: currentStatus,
      scheduledDate: tourEditData.scheduledDate || undefined,
      notes: tourEditData.notes || undefined,
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Tour updated')
      setEditingTourId(null)
      router.refresh()
    }
  }

  // Offer handlers
  const handleOfferStatusChange = async (offerId: string, status: OfferStatus) => {
    const extraData = editingOfferId === offerId ? { notes: offerNotesEdit || undefined } : {}
    const result = await updateOfferStatus({ offerId, status, ...extraData })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Offer status updated')
      setEditingOfferId(null)
      router.refresh()
    }
  }

  const handleSaveOfferEdit = async (offerId: string, currentStatus: OfferStatus) => {
    const result = await updateOfferStatus({
      offerId,
      status: currentStatus,
      notes: offerNotesEdit || undefined,
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Offer updated')
      setEditingOfferId(null)
      router.refresh()
    }
  }

  // Confirm dialog handler
  const handleConfirmAction = async () => {
    if (!confirmAction) return
    setIsConfirmLoading(true)
    try {
      let result: { error?: string }
      switch (confirmAction.type) {
        case 'deleteSavedHome':
          result = await deleteSavedHome(confirmAction.id)
          break
        case 'cancelTour':
          result = await cancelTour(confirmAction.id)
          break
        case 'withdrawOffer':
          result = await withdrawOffer(confirmAction.id)
          break
      }
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          confirmAction.type === 'deleteSavedHome' ? 'Saved home deleted' :
          confirmAction.type === 'withdrawOffer' ? 'Offer withdrawn' :
          'Tour cancelled'
        )
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsConfirmLoading(false)
      setConfirmAction(null)
    }
  }

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No buyer clients yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name or email..."
          className="max-w-sm h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buyers</SelectItem>
            <SelectItem value="has_active_tours">Active Tours</SelectItem>
            <SelectItem value="has_active_offers">Active Offers</SelectItem>
            <SelectItem value="no_activity">No Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredBuyers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No buyers match your search.
        </div>
      )}

      {filteredBuyers.map((buyer) => (
        <div key={buyer.id} className="rounded-md border">
          {/* Buyer header row */}
          <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleBuyer(buyer.id)}
          >
            {expandedBuyers.has(buyer.id)
              ? <ChevronDown className="h-4 w-4 shrink-0" />
              : <ChevronRight className="h-4 w-4 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{buyer.name || 'Unnamed'}</p>
              <p className="text-sm text-muted-foreground">{buyer.email}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{buyer.totalHomes} home{buyer.totalHomes !== 1 ? 's' : ''}</span>
              {buyer.activeTours > 0 && (
                <Badge variant="secondary">
                  {buyer.activeTours} tour{buyer.activeTours !== 1 ? 's' : ''}
                </Badge>
              )}
              {buyer.activeOffers > 0 && (
                <Badge>
                  {buyer.activeOffers} offer{buyer.activeOffers !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Expanded: saved homes table */}
          {expandedBuyers.has(buyer.id) && (
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-10">Link</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyer.savedHomes.map((home) => (
                    <Fragment key={home.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleHome(home.id)}
                      >
                        <TableCell>
                          {(home.tours.length > 0 || home.offer) && (
                            expandedHomes.has(home.id)
                              ? <ChevronDown className="h-3 w-3" />
                              : <ChevronRight className="h-3 w-3" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{home.address}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {[home.city, home.state].filter(Boolean).join(', ') || home.zipCode || '—'}
                        </TableCell>
                        <TableCell>{formatPrice(home.price)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {home.bedrooms != null || home.bathrooms != null
                            ? `${home.bedrooms ?? '—'} bd, ${home.bathrooms ?? '—'} ba${home.squareFeet ? `, ${home.squareFeet.toLocaleString()} sqft` : ''}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={homeStatusColors[home.status]}>
                            {homeStatusLabels[home.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(home.createdAt)}
                        </TableCell>
                        <TableCell>
                          {home.listingUrl && (
                            <a
                              href={home.listingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setConfirmAction({
                              type: 'deleteSavedHome',
                              id: home.id,
                              label: `Delete "${home.address}" and all its tours/offers`,
                            })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded: tours & offer detail */}
                      {expandedHomes.has(home.id) && (home.tours.length > 0 || home.offer) && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/10 p-4">
                            {/* Tours */}
                            {home.tours.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">
                                  Tours ({home.tours.length})
                                </h4>
                                <div className="rounded border bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Requested</TableHead>
                                        <TableHead>Scheduled</TableHead>
                                        <TableHead>Availability</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {home.tours.map((tour) => (
                                        <TableRow key={tour.id}>
                                          <TableCell>{formatDate(tour.requestedDate)}</TableCell>
                                          <TableCell onClick={(e) => e.stopPropagation()}>
                                            {editingTourId === tour.id ? (
                                              <Input
                                                type="date"
                                                className="w-[150px] h-8"
                                                value={tourEditData.scheduledDate}
                                                onChange={(e) => setTourEditData(prev => ({
                                                  ...prev,
                                                  scheduledDate: e.target.value,
                                                }))}
                                              />
                                            ) : (
                                              formatDate(tour.scheduledDate)
                                            )}
                                          </TableCell>
                                          <TableCell className="text-sm max-w-[200px] truncate">
                                            {tour.availability || '—'}
                                          </TableCell>
                                          <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Select
                                              value={tour.status}
                                              onValueChange={(val) =>
                                                handleTourStatusChange(tour.id, val as TourStatus)
                                              }
                                            >
                                              <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="REQUESTED">Requested</SelectItem>
                                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </TableCell>
                                          <TableCell className="text-sm max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                            {editingTourId === tour.id ? (
                                              <Input
                                                className="h-8"
                                                placeholder="Add notes..."
                                                value={tourEditData.notes}
                                                onChange={(e) => setTourEditData(prev => ({
                                                  ...prev,
                                                  notes: e.target.value,
                                                }))}
                                              />
                                            ) : (
                                              <span className="truncate block">{tour.notes || '—'}</span>
                                            )}
                                          </TableCell>
                                          <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1">
                                              {editingTourId === tour.id ? (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleSaveTourEdit(tour.id, tour.status)}
                                                  >
                                                    <Check className="h-3.5 w-3.5" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => setEditingTourId(null)}
                                                  >
                                                    <XIcon className="h-3.5 w-3.5" />
                                                  </Button>
                                                </>
                                              ) : (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => {
                                                      setEditingTourId(tour.id)
                                                      setTourEditData({
                                                        scheduledDate: tour.scheduledDate
                                                          ? new Date(tour.scheduledDate).toISOString().split('T')[0]
                                                          : '',
                                                        notes: tour.notes || '',
                                                      })
                                                    }}
                                                  >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                  </Button>
                                                  {['REQUESTED', 'SCHEDULED'].includes(tour.status) && (
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                                      onClick={() => setConfirmAction({
                                                        type: 'cancelTour',
                                                        id: tour.id,
                                                        label: `Cancel tour for "${home.address}"`,
                                                      })}
                                                    >
                                                      <Ban className="h-3.5 w-3.5" />
                                                    </Button>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Offer */}
                            {home.offer && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Offer</h4>
                                <div className="rounded border bg-background p-4 flex flex-wrap items-center gap-4">
                                  <div>
                                    <span className="text-sm text-muted-foreground">Amount:</span>{' '}
                                    <span className="font-semibold">
                                      {formatPrice(home.offer.amount)}
                                    </span>
                                  </div>
                                  <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <Select
                                      value={home.offer.status}
                                      onValueChange={(val) =>
                                        handleOfferStatusChange(home.offer!.id, val as OfferStatus)
                                      }
                                    >
                                      <SelectTrigger className="w-[140px] h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                        <SelectItem value="COUNTERED">Countered</SelectItem>
                                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">Submitted:</span>{' '}
                                    <span className="text-sm">{formatDate(home.offer.createdAt)}</span>
                                  </div>
                                  {/* Action buttons */}
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {editingOfferId === home.offer.id ? (
                                      <>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7"
                                          onClick={() => handleSaveOfferEdit(home.offer!.id, home.offer!.status)}
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7"
                                          onClick={() => setEditingOfferId(null)}
                                        >
                                          <XIcon className="h-3.5 w-3.5" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7"
                                          onClick={() => {
                                            setEditingOfferId(home.offer!.id)
                                            setOfferNotesEdit(home.offer!.notes || '')
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {['DRAFT', 'SUBMITTED', 'COUNTERED'].includes(home.offer.status) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-destructive hover:text-destructive text-xs"
                                            onClick={() => setConfirmAction({
                                              type: 'withdrawOffer',
                                              id: home.offer!.id,
                                              label: `Withdraw offer on "${home.address}"`,
                                            })}
                                          >
                                            Withdraw
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  {/* Notes field */}
                                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-sm text-muted-foreground">Notes:</span>{' '}
                                    {editingOfferId === home.offer.id ? (
                                      <Input
                                        className="mt-1 h-8"
                                        placeholder="Add notes..."
                                        value={offerNotesEdit}
                                        onChange={(e) => setOfferNotesEdit(e.target.value)}
                                      />
                                    ) : (
                                      <span className="text-sm">{home.offer.notes || '—'}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}

      {/* Confirmation Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => {
        if (!open) setConfirmAction(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.label}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={isConfirmLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={isConfirmLoading}
            >
              {isConfirmLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
