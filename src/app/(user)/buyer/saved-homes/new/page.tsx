import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SavedHomeForm } from "@/components/forms/saved-home-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewSavedHomePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
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
            Save a Home
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a property you&apos;re interested in to track it through your home search journey.
          </p>
        </div>

        {/* Form */}
        <SavedHomeForm />
      </main>
    </div>
  )
}
