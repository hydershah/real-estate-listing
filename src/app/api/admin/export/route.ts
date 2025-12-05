import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const listings = await prisma.listing.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        }
      }
    }
  })

  const csvHeader = "ID,Title,Status,Price,Type,Address,City,State,Zip,User Email,Created At\n"
  const csvRows = listings.map(listing => {
    const title = listing.title || listing.address
    return [
      listing.id,
      `"${title.replace(/"/g, '""')}"`,
      listing.status,
      listing.price,
      listing.propertyType,
      `"${listing.address.replace(/"/g, '""')}"`,
      listing.city,
      listing.state,
      listing.zipCode,
      listing.user.email,
      listing.createdAt.toISOString()
    ].join(",")
  }).join("\n")

  const csvContent = csvHeader + csvRows

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="listings-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
