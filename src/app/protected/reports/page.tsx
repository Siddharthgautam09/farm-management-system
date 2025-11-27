import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import Link from 'next/link'
import { FileText, Skull, ShoppingCart, DollarSign, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react'

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
      icon: ShoppingCart,
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
      icon: Skull,
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
      icon: DollarSign,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reportCategories.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href} className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-gray-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${report.bgColor} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${report.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <BarChart3 className="h-3 w-3 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">{report.count}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl group-hover:text-gray-700 transition-colors">{report.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm min-h-[40px]">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`w-full h-10 sm:h-11 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-all duration-300 ${report.hoverBg} group-hover:gap-4`}>
                    <span>View Reports</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg sm:text-xl">Quick Statistics</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Overview of key metrics across all reports
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="group text-center p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{totalReports}</p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Reports</p>
            </div>
            <div className="group text-center p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-blue-200">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700 mb-1">{animalsSold}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Animals Sold</p>
            </div>
            <div className="group text-center p-4 sm:p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-red-200">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <Skull className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 mb-1">{deathsReported}</p>
              <p className="text-xs sm:text-sm text-red-600 font-medium">Deaths Reported</p>
            </div>
            <div className="group text-center p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-green-200">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-700 mb-1">{avgGrowthRate.toFixed(1)} kg</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium">Avg Growth Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
