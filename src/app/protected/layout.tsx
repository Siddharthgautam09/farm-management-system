import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { getDashboardStats } from '@/actions/dashboard'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get alert data for sidebar
  const stats = await getDashboardStats()
  const alertCount = (stats.lowStockItems?.length || 0) + (stats.upcomingVaccines?.length || 0)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        alertCount={alertCount}
        lowStockItems={stats.lowStockItems}
        upcomingVaccines={stats.upcomingVaccines}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-6">{children}</main>
    </div>
  )
}
