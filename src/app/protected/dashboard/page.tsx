import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getFinancialSummary } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Package,
  ArrowRight,
  Skull,
  ShoppingCart
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const stats = await getDashboardStats()
  const financial = await getFinancialSummary()

  // Calculate total alerts
  const alertCount = (stats.lowStockItems?.length || 0) + (stats.upcomingVaccines?.length || 0)

  return (
    <div className="space-y-4">
    <Header 
      user={user} 
      alertCount={alertCount}
      lowStockItems={stats.lowStockItems}
      upcomingVaccines={stats.upcomingVaccines}
    />
      {/* Header */}
      <div>
        <h1 className="text-3xl flex justify-center font-bold">Dashboard</h1>
      </div>

      {/* Animal Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4 px-3.5">
          <h2 className="text-lg font-bold">Animal Overview</h2>
          <Button asChild size="sm" className="bg-[#2d5a2d] hover:bg-[#1e3a1e] text-white">
            <Link href="/protected/animals/new">
              <Users className="h-4 w-4 mr-2" />
              Add Animal
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border border-gray-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between px-6">
                <div>
                  <p className="text-xl font-medium text-gray-600">Total Animals</p>
                  <p className="text-3xl font-bold">{stats.totalAnimals}</p>
                </div>
                <Users className="h-10 w-10 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between px-6">
                <div>
                  <p className="text-xl font-medium text-gray-600">Active Animals</p>
                  <p className="text-3xl font-bold text-green-600">{stats.aliveAnimals}</p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between px-6">
                <div>
                  <p className="text-xl font-medium text-gray-600">Animals Sold</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.soldAnimals}</p>
                </div>
                <ShoppingCart className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between px-6">
                <div>
                  <p className="text-xl font-medium text-gray-600">Deaths</p>
                  <p className="text-3xl font-bold text-red-600">{stats.deceasedAnimals}</p>
                </div>
                <Skull className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animals by Stage & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Animals by Stage</CardTitle>
            <CardDescription className="text-xs text-gray-500">Current distribution across stages</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.byStage && Object.keys(stats.byStage).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.byStage).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center py-1.5">
                    <span className="text-sm font-medium">{stage}</span>
                    <span className="text-sm font-bold">{count as number} animals</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No active animals</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Animals by Category</CardTitle>
            <CardDescription className="text-xs text-gray-500">Breakdown by animal type</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.byCategory && Object.keys(stats.byCategory).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center py-1.5">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-sm font-bold">{count as number} animals</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No active animals</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Investment</p>
              <p className="text-2xl font-bold mb-1">${financial.totalInvestment.toFixed(2)}</p>
              <p className="text-xs text-gray-500">All purchases</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Active Investment</p>
              <p className="text-2xl font-bold text-blue-600 mb-1">${financial.activeInvestment.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Current animals</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mb-1">${financial.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">From sales</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Death Losses</p>
              <p className="text-2xl font-bold text-red-600 mb-1">${financial.totalDeathLoss.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Lost value</p>
            </CardContent>
          </Card>

          <Card className={financial.profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl sm:text-2xl font-bold break-words ${financial.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(financial.profitLoss).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {financial.profitLoss >= 0 ? 'Profit' : 'Loss'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Weight Records */}
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Weight Records</CardTitle>
                <CardDescription className="text-xs text-gray-500">Latest weight measurements</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentWeights && stats.recentWeights.length > 0 ? (
              <div className="space-y-2">
                {stats.recentWeights.map((record: { id: string; weight: number; recorded_date: string; animal?: { animal_id: string } | null }) => (
                  <div key={record.id} className="flex justify-between items-center py-1.5 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{record.animal?.animal_id}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(record.recorded_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className="text-sm font-bold">{record.weight} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent weights</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Movements</CardTitle>
                <CardDescription className="text-xs text-gray-500">Latest animal transfers</CardDescription>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentMovements && stats.recentMovements.length > 0 ? (
              <div className="space-y-2">
                {stats.recentMovements.map((movement: {
                  id: string;
                  movement_date: string;
                  animal?: { animal_id: string } | null;
                  from_stage?: { display_name?: string } | null;
                  to_stage?: { display_name?: string } | null;
                  from_room?: { identifier?: string } | null;
                  to_room?: { identifier?: string } | null;
                }) => (
                  <div key={movement.id} className="py-1.5 border-b last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{movement.animal?.animal_id}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(movement.movement_date), 'MMM dd')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{movement.from_stage?.display_name} (R{movement.from_room?.identifier})</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{movement.to_stage?.display_name} (R{movement.to_room?.identifier})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent movements</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
          <CardDescription className="text-xs text-gray-500">Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Button asChild variant="outline" className="h-14 flex-col">
              <Link href="/animals/new">
                <Users className="h-4 w-4 mb-1" />
                <span className="text-xs">Register Animal</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 flex-col">
              <Link href="/reports/slaughter/new">
                <ShoppingCart className="h-4 w-4 mb-1" />
                <span className="text-xs">Slaughter Report</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 flex-col">
              <Link href="/inventory">
                <Package className="h-4 w-4 mb-1" />
                <span className="text-xs">Manage Inventory</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 flex-col">
              <Link href="/reports/cost-analysis">
                <DollarSign className="h-4 w-4 mb-1" />
                <span className="text-xs">Cost Analysis</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}