import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ListingsTable } from "@/components/dashboard/listings-table"
import { ViewsReport } from "@/components/dashboard/views-report"
import { ShowingsWidget } from "@/components/dashboard/showings-widget"
import { OffersWidget } from "@/components/dashboard/offers-widget"
import { ChatWidget } from "@/components/dashboard/chat-widget"
import { SavingsWidget } from "@/components/dashboard/savings-widget"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate totals from all listings
  const totalShowings = listings.reduce((sum, listing) => sum + (listing.scheduledShowings || 0), 0)
  const totalOffers = listings.reduce((sum, listing) => sum + (listing.offersReceived || 0), 0)

  // Get the most recent active listing for savings display
  const activeListing = listings.find(l => l.status === 'ACTIVE') || listings[0]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-500">Manage your property listings</p>
        </div>
        <Link href="/listings/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Stats Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ShowingsWidget count={totalShowings} />
        <OffersWidget count={totalOffers} />
        <ViewsReport />
        {activeListing && (
          <SavingsWidget
            homePrice={Number(activeListing.price)}
            listingPackage={activeListing.listingPackage as 'SMART_SELLER' | 'FULL_SERVICE_AGENT'}
          />
        )}
      </div>

      {/* Listings Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
        <ListingsTable listings={listings} />
      </div>

      {/* Chat Widget */}
      <div className="max-w-sm">
        <ChatWidget />
      </div>
    </div>
  )
}
