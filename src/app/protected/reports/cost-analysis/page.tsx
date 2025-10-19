import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFarmCostSummary } from '@/actions/cost-analysis'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, PieChart } from 'lucide-react'

export default async function CostAnalysisPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const summary = await getFarmCostSummary()


  if (summary.error || !summary.costs) {
    return <div>Error loading cost data</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cost Analysis Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Complete breakdown of farm expenses
        </p>
      </div>

      {/* Total Cost Overview */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            Total Farm Investment
          </CardTitle>
          <CardDescription className="text-blue-100">
            {summary.totalAnimals} active animals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold">
            ${summary.costs.total.toFixed(2)}
          </p>
          <p className="text-blue-100 mt-2">
            Average per animal: ${summary.averageCostPerAnimal.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Purchase Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${summary.costs.purchase.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((summary.costs.purchase / summary.costs.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Feeding Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ${summary.costs.feeding.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((summary.costs.feeding / summary.costs.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Medicine Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              ${summary.costs.medicine.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((summary.costs.medicine / summary.costs.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Vaccine Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              ${summary.costs.vaccine.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((summary.costs.vaccine / summary.costs.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost per Category Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
          <CardDescription>
            Visual breakdown of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Purchase */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Purchase</span>
                <span className="text-sm text-gray-600">
                  ${summary.costs.purchase.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(summary.costs.purchase / summary.costs.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Feeding */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Feeding</span>
                <span className="text-sm text-gray-600">
                  ${summary.costs.feeding.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${(summary.costs.feeding / summary.costs.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Medicine */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Medicine</span>
                <span className="text-sm text-gray-600">
                  ${summary.costs.medicine.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-600 h-3 rounded-full"
                  style={{ width: `${(summary.costs.medicine / summary.costs.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Vaccine */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Vaccine</span>
                <span className="text-sm text-gray-600">
                  ${summary.costs.vaccine.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${(summary.costs.vaccine / summary.costs.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
