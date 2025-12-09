import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import { FileText, Skull, ShoppingCart, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import { ReportCards } from '@/components/reports/ReportCards'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch quick statistics
  const { data: slaughterReports } = await supabase
    .from('slaughter_reports')
    .select('id')
  
  const { data: deathReports } = await supabase
    .from('death_reports')
    .select('id')

  const { data: animals } = await supabase
    .from('animals')
    .select('id, is_sold, entry_weight, weights:weight_records(weight)')

  const totalReports = (slaughterReports?.length || 0) + (deathReports?.length || 0)
  const animalsSold = animals?.filter(a => a.is_sold)?.length || 0
  const deathsReported = deathReports?.length || 0
  
  // Calculate average growth rate
  let avgGrowthRate = 0
  if (animals && animals.length > 0) {
    const growthRates = animals
      .filter(a => a.entry_weight && a.weights && a.weights.length > 0)
      .map(a => {
        const latestWeight = a.weights[a.weights.length - 1]?.weight || 0
        const growth = latestWeight - (a.entry_weight || 0)
        return growth > 0 ? growth : 0
      })
    
    if (growthRates.length > 0) {
      avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    }
  }

  const reportCategories = [
    {
      title: 'Slaughter House Reports',
      description: 'Track animal sales, carcass weights, and clearance ratios',
      iconName: 'ShoppingCart' as const,
      href: '/protected/reports/slaughter',
      color: 'blue',
      count: slaughterReports?.length || 0,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50',
    },
    {
      title: 'Death Reports',
      description: 'Monitor mortality rates and causes of death',
      iconName: 'Skull' as const,
      href: '/protected/reports/death',
      color: 'red',
      count: deathReports?.length || 0,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      hoverBg: 'hover:bg-red-50',
    },
    {
      title: 'Cost Analysis',
      description: 'Complete financial breakdown of farm expenses',
      iconName: 'DollarSign' as const,
      href: '/protected/reports/cost-analysis',
      color: 'green',
      count: totalReports,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverBg: 'hover:bg-green-50',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton 
          href="/protected/dashboard"
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
        />
        <div className="flex-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        </div>
        <div className="w-9 sm:w-10 shrink-0" />
      </div>

      <ReportCards reportCategories={reportCategories} />

      {/* Quick Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg sm:text-xl font-bold">Quick Statistics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Total Reports
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{totalReports}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Animals Sold
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{animalsSold}</p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Deaths Reported
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{deathsReported}</p>
                </div>
                <Skull className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 h-20 sm:h-24">
            <CardContent className="p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    Avg Growth Rate
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{avgGrowthRate.toFixed(1)} kg</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
