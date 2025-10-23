import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, getFinancialSummary } from '@/actions/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get dashboard data
  const stats = await getDashboardStats()
  const financials = await getFinancialSummary()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your farm management system
        </p>
      </div>

      {/* Animal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalAnimals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Alive Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.aliveAnimals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sold Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.soldAnimals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Deceased Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.deceasedAnimals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financials.totalInvestment.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${financials.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${financials.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${financials.profitLoss.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Animals by Stage */}
      {stats.byStage && Object.keys(stats.byStage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Animals by Stage</CardTitle>
            <CardDescription>Distribution of live animals across stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byStage).map(([stage, count]) => (
                <Badge key={stage} variant="outline" className="text-sm">
                  {stage}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animals by Category */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Animals by Category</CardTitle>
            <CardDescription>Distribution of live animals by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Badge key={category} variant="secondary" className="text-sm">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items */}
      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockItems.map((item: { id: string; product_name: string; quantity: number; unit: string | null }) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{item.product_name}</span>
                  <Badge variant="destructive">{item.quantity} {item.unit || 'units'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}