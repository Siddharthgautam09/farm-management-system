import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Package, Pill, Syringe, ShoppingBag } from 'lucide-react'

export default async function CostAnalysisPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // ==========================================
  // 1. ANIMAL COSTS
  // ==========================================
  const { data: animals } = await supabase
    .from('animals')
    .select('purchase_price, is_alive, is_sold, category')

  const totalInvestment = animals?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0
  const activeInvestment = animals?.filter(a => a.is_alive && !a.is_sold)
    .reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0
  const totalAnimals = animals?.length || 0
  const activeAnimals = animals?.filter(a => a.is_alive && !a.is_sold).length || 0

  // ==========================================
  // 2. SLAUGHTER REVENUE
  // ==========================================
  const { data: slaughterReports } = await supabase
    .from('slaughter_reports')
    .select('selling_price, slaughter_weight')

  const totalRevenue = slaughterReports?.reduce((sum, r) => sum + (r.selling_price || 0), 0) || 0
  const totalAnimalsSold = slaughterReports?.length || 0
  const avgRevenuePerAnimal = totalAnimalsSold > 0 ? totalRevenue / totalAnimalsSold : 0

  // ==========================================
  // 3. DEATH LOSSES
  // ==========================================
  const { data: deathReports } = await supabase
    .from('death_reports')
    .select('animal:animals(purchase_price)')

  const totalDeathLoss = deathReports?.reduce(
    (sum: number, r: { animal: { purchase_price: number | null } | null }) => {
      return sum + (r.animal?.purchase_price || 0)
    }, 
    0
  ) || 0
  const totalDeaths = deathReports?.length || 0

  // ==========================================
  // 4. FEEDING COSTS
  // ==========================================
  const { data: feedingLogs } = await supabase
    .from('feeding_logs')
    .select('feed_type, mcr_quantity, mcr_price, concentrate_quantity, concentrate_price, bale_quantity, bale_price, premix_quantity, premix_price')

  const feedingCostsByType = feedingLogs?.reduce((acc: Record<string, number>, log) => {
    // Calculate cost based on feed type
    let cost = 0
    if (log.mcr_quantity && log.mcr_price) {
      cost += log.mcr_quantity * log.mcr_price
    }
    if (log.concentrate_quantity && log.concentrate_price) {
      cost += log.concentrate_quantity * log.concentrate_price
    }
    if (log.bale_quantity && log.bale_price) {
      cost += log.bale_quantity * log.bale_price
    }
    if (log.premix_quantity && log.premix_price) {
      cost += log.premix_quantity * log.premix_price
    }
    acc[log.feed_type] = (acc[log.feed_type] || 0) + cost
    return acc
  }, {} as Record<string, number>) || {}

  const totalFeedingCost = Object.values(feedingCostsByType).reduce((sum, cost) => sum + cost, 0)

  // ==========================================
  // 5. MEDICINE COSTS
  // ==========================================
  const { data: medicineLogs } = await supabase
    .from('medicine_logs')
    .select('drug_dose, drug_price, treatment_days')

  const totalMedicineCost = medicineLogs?.reduce(
    (sum, log) => {
      const dose = log.drug_dose || 0
      const price = log.drug_price || 0
      const days = log.treatment_days || 1
      return sum + (dose * price * days)
    }, 0
  ) || 0

  // ==========================================
  // 6. VACCINE COSTS
  // ==========================================
  const { data: vaccineLogs } = await supabase
    .from('vaccine_logs')
    .select('vaccine_price')

  const totalVaccineCost = vaccineLogs?.reduce(
    (sum, log) => sum + (log.vaccine_price || 0), 0
  ) || 0

  // ==========================================
  // 7. TOTAL COSTS & PROFIT/LOSS
  // ==========================================
  const totalOperatingCost = totalFeedingCost + totalMedicineCost + totalVaccineCost
  const totalCosts = totalInvestment + totalOperatingCost
  const netProfitLoss = totalRevenue - (totalInvestment - activeInvestment + totalDeathLoss)

  // Per-animal costs
  const avgCostPerAnimal = activeAnimals > 0 ? totalOperatingCost / activeAnimals : 0
  const avgInvestmentPerAnimal = activeAnimals > 0 ? activeInvestment / activeAnimals : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cost Analysis</h1>
        <p className="text-gray-600 mt-2">
          Complete financial breakdown of farm operations
        </p>
      </div>

      {/* Overall Financial Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalInvestment.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{totalAnimals} animals</p>
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
                ${activeInvestment.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activeAnimals} animals</p>
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
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{totalAnimalsSold} sold</p>
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
                ${totalDeathLoss.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{totalDeaths} deaths</p>
            </CardContent>
          </Card>

          <Card className={netProfitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                {netProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                Net {netProfitLoss >= 0 ? 'Profit' : 'Loss'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(netProfitLoss).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {netProfitLoss >= 0 ? 'Positive' : 'Negative'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operating Costs Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Operating Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Feeding Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalFeedingCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All feed types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medicine Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalMedicineCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All treatments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Vaccine Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalVaccineCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All vaccinations</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Operating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                ${totalOperatingCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">All expenses</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feeding Costs by Type */}
      {Object.keys(feedingCostsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feeding Costs by Type</CardTitle>
            <CardDescription>Breakdown of feed expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(feedingCostsByType).map(([type, cost]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-semibold">${cost.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Animal Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Animal Analysis</CardTitle>
          <CardDescription>Average costs per active animal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Investment</p>
              <p className="text-2xl font-bold">${avgInvestmentPerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per animal</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Operating Cost</p>
              <p className="text-2xl font-bold">${avgCostPerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per animal</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Revenue</p>
              <p className="text-2xl font-bold text-green-600">${avgRevenuePerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per sold animal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
