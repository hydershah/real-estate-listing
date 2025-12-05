import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectedSavingsCard } from "@/components/dashboard/projected-savings-card"
import { ActiveListingsCard } from "@/components/dashboard/active-listings-card"
import { ListingsTable } from "@/components/dashboard/listings-table"
import { ViewsReportCard } from "@/components/dashboard/views-report-card"
import { ScheduledShowingsCard } from "@/components/dashboard/scheduled-showings-card"
import { OffersReceivedCard } from "@/components/dashboard/offers-received-card"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const rawListings = await prisma.listing.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize Decimal fields for client components
  const listings = rawListings.map(listing => ({
    ...listing,
    price: Number(listing.price),
    bathrooms: Number(listing.bathrooms),
    hoaFee: listing.hoaFee ? Number(listing.hoaFee) : null,
    taxAmount: listing.taxAmount ? Number(listing.taxAmount) : null,
    lotSize: listing.lotSize ? Number(listing.lotSize) : null,
  }))

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'ACTIVE').length
  const pendingListings = listings.filter(l =>
    l.status === 'PENDING_REVIEW' || l.status === 'PENDING_SALE'
  ).length

  // Calculate projected savings based on listing package
  // Dollar_Saved = (0.03 - LC_Rate) * Home_Price
  // LC_Rate = 0.01 for Smart Seller, 0.02 for Full-Service Agent
  const activeListingsData = listings.filter(l => l.status === 'ACTIVE')
  let projectedSavings = 0

  activeListingsData.forEach(listing => {
    const price = Number(listing.price)
    // Default to 2% rate if no package selected
    const lcRate = listing.listingPackage === 'SMART_SELLER' ? 0.01 : 0.02
    const dollarSaved = (0.03 - lcRate) * price
    projectedSavings += dollarSaved
  })

  projectedSavings = Math.round(projectedSavings)

  // Sample views data - in a real app this would come from analytics
  const viewsData = [
    { label: 'MLS', value: 0, color: '#00D9A5' },
    { label: 'Realtor.com', value: 0, color: '#3B82F6' },
    { label: 'Redfin', value: 0, color: '#8B5CF6' },
    { label: 'Zillow', value: 0, color: '#F59E0B' },
  ]

  // Aggregate showings and offers from all listings
  const totalShowings = listings.reduce((sum, l) => sum + (l.scheduledShowings || 0), 0)
  const totalOffers = listings.reduce((sum, l) => sum + (l.offersReceived || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hello {session.user.name?.split(' ')[0] || 'Agent'},
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your listings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Projected Savings */}
          <ProjectedSavingsCard amount={projectedSavings} />

          {/* Active Listings */}
          <ActiveListingsCard
            activeCount={activeListings}
            pendingCount={pendingListings}
          />

          {/* Views Report */}
          <ViewsReportCard data={viewsData} />

          {/* Scheduled Showings */}
          <ScheduledShowingsCard count={totalShowings} />

          {/* Offers Received */}
          <OffersReceivedCard count={totalOffers} />
        </div>

        {/* Listings Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                My Listings
              </h2>
              <p className="text-sm text-muted-foreground">
                {listings.length} {listings.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <Link href="/listings/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">+ New Listing</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/50">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No listings yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Get started by creating your first property listing. It only takes a few minutes.
              </p>
              <Link href="/listings/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Listing
                </Button>
              </Link>
            </div>
          ) : (
            <ListingsTable listings={listings} />
          )}
        </div>
      </main>
    </div>
  )
}
