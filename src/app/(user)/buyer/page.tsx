import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EstimatedRebateCard } from "@/components/buyer/estimated-rebate-card"
import { SavedHomesCountCard } from "@/components/buyer/saved-homes-count-card"
import { UpcomingToursCard } from "@/components/buyer/upcoming-tours-card"
import { ActiveOffersCard } from "@/components/buyer/active-offers-card"
import { SavedHomesCards } from "@/components/buyer/saved-homes-cards"
import { Plus } from "lucide-react"

// Rebate calculation - 1% of offer price for MVP
const REBATE_PERCENTAGE = 0.01

export default async function BuyerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch saved homes with tours and offers
  const rawSavedHomes = await prisma.savedHome.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      tours: true,
      offer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Serialize Decimal fields for client components
  const savedHomes = rawSavedHomes.map((home) => ({
    ...home,
    price: home.price ? Number(home.price) : null,
    bathrooms: home.bathrooms ? Number(home.bathrooms) : null,
  }))

  // Count saved homes by status
  const savedCount = savedHomes.filter((h) => h.status === "SAVED").length
  const touringCount = savedHomes.filter((h) => h.status === "TOURING").length
  const offerSubmittedCount = savedHomes.filter(
    (h) => h.status === "OFFER_SUBMITTED"
  ).length

  // Fetch all tours for this user's saved homes
  const savedHomeIds = savedHomes.map((h) => h.id)
  const tours = await prisma.tour.findMany({
    where: {
      savedHomeId: { in: savedHomeIds },
    },
  })

  // Count tours by status
  const requestedTours = tours.filter((t) => t.status === "REQUESTED").length
  const scheduledTours = tours.filter((t) => t.status === "SCHEDULED").length
  const completedTours = tours.filter((t) => t.status === "COMPLETED").length

  // Fetch all offers for this user's saved homes
  const offers = await prisma.offer.findMany({
    where: {
      savedHomeId: { in: savedHomeIds },
    },
  })

  // Count offers by status
  const draftOffers = offers.filter((o) => o.status === "DRAFT").length
  const submittedOffers = offers.filter((o) => o.status === "SUBMITTED").length
  const counteredOffers = offers.filter((o) => o.status === "COUNTERED").length
  const acceptedOffers = offers.filter((o) => o.status === "ACCEPTED").length
  const rejectedOffers = offers.filter((o) => o.status === "REJECTED").length

  // Calculate estimated rebate (1% of submitted offer amounts)
  const estimatedRebate = savedHomes
    .filter((home) => home.status === "OFFER_SUBMITTED" && home.offer?.amount)
    .reduce((total, home) => {
      const offerAmount = home.offer?.amount ? Number(home.offer.amount) : 0
      return total + offerAmount * REBATE_PERCENTAGE
    }, 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hello {session.user.name?.split(" ")[0] || "Buyer"},
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your home search.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Estimated Rebate */}
          <EstimatedRebateCard amount={Math.round(estimatedRebate)} />

          {/* Saved Homes */}
          <SavedHomesCountCard
            savedCount={savedCount}
            touringCount={touringCount}
            offerCount={offerSubmittedCount}
          />

          {/* Upcoming Tours */}
          <UpcomingToursCard
            requestedCount={requestedTours}
            scheduledCount={scheduledTours}
            completedCount={completedTours}
          />

          {/* Active Offers */}
          <ActiveOffersCard
            draftCount={draftOffers}
            submittedCount={submittedOffers}
            counteredCount={counteredOffers}
            acceptedCount={acceptedOffers}
            rejectedCount={rejectedOffers}
          />
        </div>

        {/* Saved Homes Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Saved Homes
              </h2>
              <p className="text-sm text-muted-foreground">
                {savedHomes.length}{" "}
                {savedHomes.length === 1 ? "property" : "properties"}
              </p>
            </div>
            <Link href="/buyer/saved-homes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Save a Home</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>

          {savedHomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/50">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No saved homes yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start tracking homes you&apos;re interested in. Add properties
                manually to keep track of your home search journey.
              </p>
              <Link href="/buyer/saved-homes/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Save Your First Home
                </Button>
              </Link>
            </div>
          ) : (
            <SavedHomesCards savedHomes={savedHomes} />
          )}
        </div>
      </main>
    </div>
  )
}
