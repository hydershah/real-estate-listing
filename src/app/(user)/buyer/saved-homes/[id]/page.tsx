import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RequestTourDialog } from "@/components/buyer/request-tour-dialog"
import { SubmitOfferDialog } from "@/components/buyer/submit-offer-dialog"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  FileText,
  Pencil,
  ExternalLink,
  Clock,
} from "lucide-react"

const statusColors: Record<string, string> = {
  SAVED: "bg-muted text-muted-foreground",
  TOURING: "bg-chart-2 text-white",
  OFFER_SUBMITTED: "bg-chart-3 text-white",
}

const statusLabels: Record<string, string> = {
  SAVED: "Saved",
  TOURING: "Touring",
  OFFER_SUBMITTED: "Offer Submitted",
}

const tourStatusColors: Record<string, string> = {
  REQUESTED: "bg-chart-4 text-white",
  SCHEDULED: "bg-chart-2 text-white",
  COMPLETED: "bg-primary text-primary-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
}

const offerStatusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-chart-2 text-white",
  COUNTERED: "bg-chart-4 text-white",
  ACCEPTED: "bg-primary text-primary-foreground",
  REJECTED: "bg-destructive text-white",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SavedHomeDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const savedHome = await prisma.savedHome.findUnique({
    where: { id },
    include: {
      tours: {
        orderBy: { createdAt: "desc" },
      },
      offer: true,
    },
  })

  if (!savedHome) {
    notFound()
  }

  if (savedHome.userId !== session.user.id) {
    redirect("/buyer")
  }

  // Serialize decimal fields
  const home = {
    ...savedHome,
    price: savedHome.price ? Number(savedHome.price) : null,
    bathrooms: savedHome.bathrooms ? Number(savedHome.bathrooms) : null,
    offer: savedHome.offer
      ? {
          ...savedHome.offer,
          amount: savedHome.offer.amount ? Number(savedHome.offer.amount) : null,
        }
      : null,
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "—"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "—"
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const canRequestTour = home.status === "SAVED" || home.status === "TOURING"
  const canSubmitOffer = home.status !== "OFFER_SUBMITTED" && !home.offer

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/buyer">
          <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {home.address}
              </h1>
              <Badge className={statusColors[home.status]}>
                {statusLabels[home.status]}
              </Badge>
            </div>
            {(home.city || home.state || home.zipCode) && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[home.city, home.state, home.zipCode].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/buyer/saved-homes/${home.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            {canRequestTour && (
              <RequestTourDialog savedHomeId={home.id} address={home.address}>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Tour
                </Button>
              </RequestTourDialog>
            )}
            {canSubmitOffer && (
              <SubmitOfferDialog
                savedHomeId={home.id}
                address={home.address}
                listingPrice={home.price}
              >
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Offer
                </Button>
              </SubmitOfferDialog>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {home.price && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </span>
                  <span className="font-semibold text-lg">
                    {formatPrice(home.price)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-semibold">{home.bedrooms ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Beds</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-semibold">{home.bathrooms ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Baths</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Square className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-semibold">
                    {home.squareFeet?.toLocaleString() ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Sq Ft</p>
                </div>
              </div>

              {home.listingUrl && (
                <a
                  href={home.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm mt-4"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Listing
                </a>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {home.notes ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {home.notes}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No notes added</p>
              )}
            </CardContent>
          </Card>

          {/* Tours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tours</CardTitle>
              {canRequestTour && (
                <RequestTourDialog savedHomeId={home.id} address={home.address}>
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Request
                  </Button>
                </RequestTourDialog>
              )}
            </CardHeader>
            <CardContent>
              {home.tours.length === 0 ? (
                <p className="text-muted-foreground italic">No tours requested</p>
              ) : (
                <div className="space-y-3">
                  {home.tours.map((tour) => (
                    <div
                      key={tour.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {tour.scheduledDate
                              ? formatDate(tour.scheduledDate)
                              : tour.requestedDate
                              ? `Requested: ${formatDate(tour.requestedDate)}`
                              : "Date pending"}
                          </span>
                        </div>
                        {tour.availability && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tour.availability}
                          </p>
                        )}
                      </div>
                      <Badge className={tourStatusColors[tour.status]}>
                        {tour.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Offer</CardTitle>
              {canSubmitOffer && (
                <SubmitOfferDialog
                  savedHomeId={home.id}
                  address={home.address}
                  listingPrice={home.price}
                >
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Submit
                  </Button>
                </SubmitOfferDialog>
              )}
            </CardHeader>
            <CardContent>
              {!home.offer ? (
                <p className="text-muted-foreground italic">No offer submitted</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-lg">
                      {formatPrice(home.offer.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={offerStatusColors[home.offer.status]}>
                      {home.offer.status}
                    </Badge>
                  </div>
                  {home.offer.amount && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Est. Rebate</span>
                      <span className="font-semibold text-primary">
                        {formatPrice(home.offer.amount * 0.01)}
                      </span>
                    </div>
                  )}
                  {home.offer.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {home.offer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
