import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { AdminListingsTable } from "@/components/admin/admin-listings-table"
import Link from "next/link"

export default async function AdminListingsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Listings</h1>
        <a href="/api/admin/export" target="_blank">
          <Button variant="outline">Export CSV</Button>
        </a>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <AdminListingsTable listings={listings} />
      </div>
    </div>
  )
}
