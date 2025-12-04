import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader userName={session.user.name} />
      <main>{children}</main>
    </div>
  )
}
