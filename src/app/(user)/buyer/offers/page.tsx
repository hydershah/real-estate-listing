import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, FileText, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react"

const offerStatusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-chart-2 text-white",
  COUNTERED: "bg-chart-4 text-white",
  ACCEPTED: "bg-primary text-primary-foreground",
  REJECTED: "bg-destructive text-white",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

const offerStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  COUNTERED: "Countered",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
}

export default async function OffersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get all saved homes for this user with their offers
  const savedHomes = await prisma.savedHome.findMany({
    where: {
      userId: session.user.id,
      offer: { isNot: null },
    },
    include: {
      offer: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Map to offers with saved home info
  const offers = savedHomes
    .filter((home) => home.offer)
    .map((home) => ({
      ...home.offer!,
      amount: home.offer!.amount ? Number(home.offer!.amount) : null,
      savedHome: {
        id: home.id,
        address: home.address,
        city: home.city,
        state: home.state,
        price: home.price ? Number(home.price) : null,
      },
    }))

  // Sort by status priority
  const statusPriority: Record<string, number> = {
    SUBMITTED: 0,
    COUNTERED: 1,
    ACCEPTED: 2,
    DRAFT: 3,
    REJECTED: 4,
    WITHDRAWN: 5,
  }
  offers.sort((a, b) => statusPriority[a.status] - statusPriority[b.status])

  const formatPrice = (price: number | null) => {
    if (!price) return "—"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(date))
  }

  const activeOffers = offers.filter(
    (o) => o.status === "SUBMITTED" || o.status === "COUNTERED"
  )
  const closedOffers = offers.filter(
    (o) =>
      o.status === "ACCEPTED" ||
      o.status === "REJECTED" ||
      o.status === "WITHDRAWN" ||
      o.status === "DRAFT"
  )

  // Calculate total estimated rebate from accepted offers
  const totalRebate = offers
    .filter((o) => o.status === "ACCEPTED" && o.amount)
    .reduce((sum, o) => sum + (o.amount || 0) * 0.01, 0)

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

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Offers
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your property offers
            </p>
          </div>

          {totalRebate > 0 && (
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Rebate (Accepted)</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(totalRebate)}</p>
            </div>
          )}
        </div>

        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/50">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No offers yet
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Submit an offer on any of your saved homes to get started.
            </p>
            <Link href="/buyer">
              <Button>View Saved Homes</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Offers */}
            {activeOffers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-chart-2" />
                  Active Offers ({activeOffers.length})
                </h2>
                <div className="space-y-3">
                  {activeOffers.map((offer) => (
                    <Card key={offer.id} className="border-0 bg-card">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <Link
                              href={`/buyer/saved-homes/${offer.savedHome.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {offer.savedHome.address}
                            </Link>
                            {(offer.savedHome.city || offer.savedHome.state) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {[offer.savedHome.city, offer.savedHome.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                <span className="font-semibold">
                                  {formatPrice(offer.amount)}
                                </span>
                              </span>
                              {offer.savedHome.price && (
                                <span className="text-muted-foreground">
                                  List: {formatPrice(offer.savedHome.price)}
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                Submitted: {formatDate(offer.createdAt)}
                              </span>
                            </div>
                            {offer.amount && (
                              <p className="text-xs text-primary mt-1">
                                Est. rebate: {formatPrice(offer.amount * 0.01)}
                              </p>
                            )}
                          </div>
                          <Badge className={offerStatusColors[offer.status]}>
                            {offerStatusLabels[offer.status]}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Closed Offers */}
            {closedOffers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Closed Offers ({closedOffers.length})
                </h2>
                <div className="space-y-3">
                  {closedOffers.map((offer) => (
                    <Card key={offer.id} className="border-0 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <Link
                              href={`/buyer/saved-homes/${offer.savedHome.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {offer.savedHome.address}
                            </Link>
                            {(offer.savedHome.city || offer.savedHome.state) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {[offer.savedHome.city, offer.savedHome.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                <span className="font-semibold">
                                  {formatPrice(offer.amount)}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {formatDate(offer.updatedAt)}
                              </span>
                            </div>
                            {offer.status === "ACCEPTED" && offer.amount && (
                              <p className="text-xs text-primary mt-1 font-medium">
                                Rebate earned: {formatPrice(offer.amount * 0.01)}
                              </p>
                            )}
                          </div>
                          <Badge className={offerStatusColors[offer.status]}>
                            {offerStatusLabels[offer.status]}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
