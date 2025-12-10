import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Package, Pill, Syringe, ShoppingBag } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'  
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
  const netProfitLoss = totalRevenue - (totalInvestment - activeInvestment + totalDeathLoss)

  // Per-animal costs
  const avgCostPerAnimal = activeAnimals > 0 ? totalOperatingCost / activeAnimals : 0
  const avgInvestmentPerAnimal = activeAnimals > 0 ? activeInvestment / activeAnimals : 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
          <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton 
          href="/protected/dashboard"
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
        />
        <div className="flex-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Cost Analysis</h1>
        </div>
        <div className="w-9 sm:w-10 shrink-0" />
      </div>
      </div>

      {/* Overall Financial Summary */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Investment
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">${totalInvestment.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Active Investment
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">${activeInvestment.toFixed(2)}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Revenue
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Death Losses
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">${totalDeathLoss.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow ${netProfitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Net {netProfitLoss >= 0 ? 'Profit' : 'Loss'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(netProfitLoss).toFixed(2)}
                  </p>
                </div>
                {netProfitLoss >= 0 ? (
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operating Costs Breakdown */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Operating Costs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Feeding Costs
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">${totalFeedingCost.toFixed(2)}</p>
                </div>
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Medicine Costs
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">${totalMedicineCost.toFixed(2)}</p>
                </div>
                <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Vaccine Costs
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">${totalVaccineCost.toFixed(2)}</p>
                </div>
                <Syringe className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Operating
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">${totalOperatingCost.toFixed(2)}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feeding Costs by Type */}
      {Object.keys(feedingCostsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Feeding Costs by Type</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Breakdown of feed expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(feedingCostsByType).map(([type, cost]) => (
                <div key={type} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="capitalize text-xs shrink-0">
                      {type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm sm:text-base shrink-0">${cost.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Animal Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Per-Animal Analysis</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Average costs per active animal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 border rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Investment</p>
              <p className="text-xl sm:text-2xl font-bold break-words">${avgInvestmentPerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per animal</p>
            </div>
            <div className="p-3 sm:p-4 border rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Operating Cost</p>
              <p className="text-xl sm:text-2xl font-bold break-words">${avgCostPerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per animal</p>
            </div>
            <div className="p-3 sm:p-4 border rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">${avgRevenuePerAnimal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per sold animal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
