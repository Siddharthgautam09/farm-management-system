import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import Link from 'next/link'
import { FileText, Skull, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

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
      href: '/reports/slaughter',
      color: 'blue',
    },
    {
      title: 'Death Reports',
      description: 'Monitor mortality rates and causes of death',
      icon: Skull,
      href: '/reports/death',
      color: 'red',
    },
    {
      title: 'Cost Analysis',
      description: 'Complete financial breakdown of farm expenses',
      icon: DollarSign,
      href: '/reports/cost-analysis',
      color: 'green',
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
            <Card key={report.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-${report.color}-100 flex items-center justify-center mb-3 sm:mb-4`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${report.color}-600`} />
                </div>
                <CardTitle className="text-lg sm:text-xl">{report.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full h-9 sm:h-10 text-sm sm:text-base">
                  <Link href={report.href}>
                    View Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Quick Statistics</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overview of key metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-gray-600" />
              <p className="text-xl sm:text-2xl font-bold">{totalReports}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xl sm:text-2xl font-bold">{animalsSold}</p>
              <p className="text-xs sm:text-sm text-gray-600">Animals Sold</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <Skull className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-red-600" />
              <p className="text-xl sm:text-2xl font-bold">{deathsReported}</p>
              <p className="text-xs sm:text-sm text-gray-600">Deaths Reported</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-green-600" />
              <p className="text-xl sm:text-2xl font-bold">{avgGrowthRate.toFixed(1)} kg</p>
              <p className="text-xs sm:text-sm text-gray-600">Avg Growth Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
