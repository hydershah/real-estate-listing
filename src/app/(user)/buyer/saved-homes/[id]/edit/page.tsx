import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SavedHomeForm } from "@/components/forms/saved-home-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSavedHomePage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const savedHome = await prisma.savedHome.findUnique({
    where: { id },
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
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Back Link */}
        <Link href={`/buyer/saved-homes/${id}`}>
          <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property
          </Button>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Edit Saved Home
          </h1>
          <p className="text-muted-foreground mt-1">
            Update the details for {home.address}
          </p>
        </div>

        {/* Form */}
        <SavedHomeForm initialData={home} />
      </main>
    </div>
  )
}
