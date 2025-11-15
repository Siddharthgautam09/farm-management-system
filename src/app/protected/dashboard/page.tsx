import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats, getFinancialSummary } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Activity,
  Package,
  Syringe,
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
    <div className="space-y-6">
    <Header 
      user={user} 
      alertCount={alertCount}
      lowStockItems={stats.lowStockItems as any}
      upcomingVaccines={stats.upcomingVaccines as any}
    />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your farm operations
        </p>
      </div>

      {/* Animal Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Animal Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Animals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAnimals}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Animals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.aliveAnimals}</p>
              <p className="text-xs text-gray-500 mt-1">Currently on farm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Animals Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.soldAnimals}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Skull className="h-4 w-4" />
                Deaths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.deceasedAnimals}</p>
              <p className="text-xs text-gray-500 mt-1">Mortality</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animals by Stage & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animals by Stage</CardTitle>
            <CardDescription>Current distribution across stages</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byStage && Object.keys(stats.byStage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.byStage).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center">
                    <span className="font-medium">{stage}</span>
                    <Badge variant="secondary">{count as number} animals</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No active animals</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animals by Category</CardTitle>
            <CardDescription>Breakdown by animal type</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byCategory && Object.keys(stats.byCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="outline">{count as number} animals</Badge>
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
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${financial.totalInvestment.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                ${financial.activeInvestment.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current animals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${financial.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">From sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Death Losses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ${financial.totalDeathLoss.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Lost value</p>
            </CardContent>
          </Card>

          <Card className={financial.profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${financial.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Weight Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Weight Records</CardTitle>
              <CardDescription>Latest weight measurements</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            {stats.recentWeights && stats.recentWeights.length > 0 ? (
              <div className="space-y-3">
                {stats.recentWeights.map((record: { id: string; weight: number; recorded_date: string; animal?: { animal_id: string } | null }) => (
                  <div key={record.id} className="flex justify-between items-center pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{record.animal?.animal_id}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(record.recorded_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline">{record.weight} kg</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent weights</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Movements</CardTitle>
              <CardDescription>Latest animal transfers</CardDescription>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            {stats.recentMovements && stats.recentMovements.length > 0 ? (
              <div className="space-y-3">
                {stats.recentMovements.map((movement: {
                  id: string;
                  movement_date: string;
                  animal?: { animal_id: string } | null;
                  from_stage?: { display_name?: string } | null;
                  to_stage?: { display_name?: string } | null;
                  from_room?: { identifier?: string } | null;
                  to_room?: { identifier?: string } | null;
                }) => (
                  <div key={movement.id} className="pb-3 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{movement.animal?.animal_id}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(movement.movement_date), 'MMM dd')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>{movement.from_stage?.display_name} (Room {movement.from_room?.identifier})</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{movement.to_stage?.display_name} (Room {movement.to_room?.identifier})</span>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/animals/new">
                <Users className="h-6 w-6 mb-2" />
                Register Animal
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/reports/slaughter/new">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Slaughter Report
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/inventory">
                <Package className="h-6 w-6 mb-2" />
                Manage Inventory
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/reports/cost-analysis">
                <DollarSign className="h-6 w-6 mb-2" />
                Cost Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
