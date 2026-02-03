import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle } from "lucide-react"

const tourStatusColors: Record<string, string> = {
  REQUESTED: "bg-chart-4 text-white",
  SCHEDULED: "bg-chart-2 text-white",
  COMPLETED: "bg-primary text-primary-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
}

const tourStatusLabels: Record<string, string> = {
  REQUESTED: "Requested",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export default async function ToursPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get all saved homes for this user with their tours
  const savedHomes = await prisma.savedHome.findMany({
    where: { userId: session.user.id },
    include: {
      tours: {
        orderBy: [
          { status: "asc" },
          { scheduledDate: "asc" },
          { createdAt: "desc" },
        ],
      },
    },
  })

  // Flatten tours with saved home info
  const tours = savedHomes.flatMap((home) =>
    home.tours.map((tour) => ({
      ...tour,
      savedHome: {
        id: home.id,
        address: home.address,
        city: home.city,
        state: home.state,
      },
    }))
  )

  // Sort by status priority and date
  const statusPriority: Record<string, number> = {
    SCHEDULED: 0,
    REQUESTED: 1,
    COMPLETED: 2,
    CANCELLED: 3,
  }
  tours.sort((a, b) => {
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status]
    if (priorityDiff !== 0) return priorityDiff
    if (a.scheduledDate && b.scheduledDate) {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const formatDate = (date: Date | null) => {
    if (!date) return "—"
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const activeTours = tours.filter(
    (t) => t.status === "REQUESTED" || t.status === "SCHEDULED"
  )
  const pastTours = tours.filter(
    (t) => t.status === "COMPLETED" || t.status === "CANCELLED"
  )

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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Tours
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your scheduled and past property tours
          </p>
        </div>

        {tours.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/50">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tours yet
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Request a tour from any of your saved homes to get started.
            </p>
            <Link href="/buyer">
              <Button>View Saved Homes</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tours */}
            {activeTours.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-chart-2" />
                  Upcoming Tours ({activeTours.length})
                </h2>
                <div className="space-y-3">
                  {activeTours.map((tour) => (
                    <Card key={tour.id} className="border-0 bg-card">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <Link
                              href={`/buyer/saved-homes/${tour.savedHome.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {tour.savedHome.address}
                            </Link>
                            {(tour.savedHome.city || tour.savedHome.state) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {[tour.savedHome.city, tour.savedHome.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-muted-foreground">
                                {tour.scheduledDate
                                  ? `Scheduled: ${formatDate(tour.scheduledDate)}`
                                  : tour.requestedDate
                                  ? `Requested: ${formatDate(tour.requestedDate)}`
                                  : "Date pending"}
                              </span>
                            </div>
                            {tour.availability && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Availability: {tour.availability}
                              </p>
                            )}
                          </div>
                          <Badge className={tourStatusColors[tour.status]}>
                            {tourStatusLabels[tour.status]}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Tours */}
            {pastTours.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Past Tours ({pastTours.length})
                </h2>
                <div className="space-y-3">
                  {pastTours.map((tour) => (
                    <Card key={tour.id} className="border-0 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <Link
                              href={`/buyer/saved-homes/${tour.savedHome.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {tour.savedHome.address}
                            </Link>
                            {(tour.savedHome.city || tour.savedHome.state) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {[tour.savedHome.city, tour.savedHome.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {tour.scheduledDate
                                ? formatDate(tour.scheduledDate)
                                : formatDate(tour.createdAt)}
                            </p>
                          </div>
                          <Badge className={tourStatusColors[tour.status]}>
                            {tourStatusLabels[tour.status]}
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
