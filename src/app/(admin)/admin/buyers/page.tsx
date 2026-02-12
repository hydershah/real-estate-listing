import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText } from "lucide-react"
import { AdminBuyersTable } from "@/components/admin/admin-buyers-table"
import type { SerializedAdminBuyer } from "@/types/buyer"

export default async function AdminBuyersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch all users who have saved homes (active buyers)
  const buyerUsers = await prisma.user.findMany({
    where: {
      savedHomes: {
        some: {},
      },
    },
    include: {
      savedHomes: {
        include: {
          tours: {
            orderBy: { createdAt: "desc" },
          },
          offer: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Serialize Decimal fields and compute summary counts
  const buyers: SerializedAdminBuyer[] = buyerUsers.map((user) => {
    const serializedHomes = user.savedHomes.map((home) => ({
      id: home.id,
      address: home.address,
      city: home.city,
      state: home.state,
      zipCode: home.zipCode,
      price: home.price ? Number(home.price) : null,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms ? Number(home.bathrooms) : null,
      squareFeet: home.squareFeet,
      listingUrl: home.listingUrl,
      notes: home.notes,
      status: home.status,
      createdAt: home.createdAt.toISOString(),
      tours: home.tours.map((tour) => ({
        id: tour.id,
        savedHomeId: tour.savedHomeId,
        requestedDate: tour.requestedDate?.toISOString() ?? null,
        scheduledDate: tour.scheduledDate?.toISOString() ?? null,
        availability: tour.availability,
        status: tour.status,
        notes: tour.notes,
        createdAt: tour.createdAt.toISOString(),
        updatedAt: tour.updatedAt.toISOString(),
      })),
      offer: home.offer
        ? {
            id: home.offer.id,
            savedHomeId: home.offer.savedHomeId,
            amount: home.offer.amount ? Number(home.offer.amount) : null,
            status: home.offer.status,
            notes: home.offer.notes,
            createdAt: home.offer.createdAt.toISOString(),
            updatedAt: home.offer.updatedAt.toISOString(),
          }
        : null,
    }))

    const activeTours = serializedHomes.reduce(
      (count, home) =>
        count +
        home.tours.filter(
          (t) => t.status === "REQUESTED" || t.status === "SCHEDULED"
        ).length,
      0
    )

    const activeOffers = serializedHomes.reduce(
      (count, home) =>
        count +
        (home.offer &&
        ["SUBMITTED", "COUNTERED"].includes(home.offer.status)
          ? 1
          : 0),
      0
    )

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      savedHomes: serializedHomes,
      totalHomes: serializedHomes.length,
      activeTours,
      activeOffers,
    }
  })

  const totalBuyers = buyers.length
  const totalActiveTours = buyers.reduce((sum, b) => sum + b.activeTours, 0)
  const totalActiveOffers = buyers.reduce((sum, b) => sum + b.activeOffers, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Buyer Clients</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuyers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveTours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveOffers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Buyers Table */}
      <div className="bg-card rounded-lg shadow p-6">
        <AdminBuyersTable buyers={buyers} />
      </div>
    </div>
  )
}
