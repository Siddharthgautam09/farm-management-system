import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Scale, Package } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/lib/types/database.types'
import { ExportButton } from '@/components/reports/SlaughterExportButton'

type SlaughterReport = Database['public']['Tables']['slaughter_reports']['Row'] & {
  animals?: {
    animal_id: string
  } | null
}

// Force dynamic rendering - absolutely no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function SlaughterReportsPage() {
  console.log('=== SLAUGHTER REPORTS PAGE RENDER ===')
  console.log('Timestamp:', new Date().toISOString())
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('❌ User not authenticated, redirecting to login')
    redirect('/auth/login')
  }

  console.log('✅ User authenticated:', user.id)

  // Fetch slaughter reports with animal details
  console.log('🔍 Fetching slaughter reports from database...')
  
  const { data: reports, error: reportsError } = await supabase
    .from('slaughter_reports')
    .select(`
      *,
      animals (
        animal_id
      )
    `)
    .order('created_at', { ascending: false })

  console.log('📊 Query Results:')
  console.log('- Reports count:', reports?.length || 0)
  console.log('- Query error:', reportsError?.message || 'none')

  if (reportsError) {
    console.error('Database query error:', reportsError)
  }

  const displayReports = reports || []

  // Prepare export data
  const exportData = displayReports.map((report) => ({
    'Animal ID': report.animals?.animal_id || report.animal_id,
    'Date': format(new Date(report.slaughter_date), 'yyyy-MM-dd'),
    'Slaughter Weight (kg)': report.slaughter_weight,
    'Carcass Weight (kg)': report.carcass_weight,
    'Carcass %': report.carcass_percentage?.toFixed(2) || '',
    'Selling Price': report.selling_price,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton 
            href="/protected/reports"
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
          />
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Slaughter Reports</h1>
          </div>
          <div className="w-9 sm:w-10 shrink-0" />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs sm:text-sm text-muted-foreground">Track and manage slaughter transactions</p>
          <div className="flex gap-2 shrink-0">
            <ExportButton data={exportData} />
            <Button asChild className="h-9 sm:h-10 text-sm sm:text-base">
              <Link href="/protected/reports/slaughter/new">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Report</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Reports</CardTitle>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{displayReports.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              ${displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.selling_price || 0), 0).toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total earnings</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg Carcass %</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.carcass_percentage || 0), 0) / displayReports.length).toFixed(1) : '0.0'}%
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Average yield</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg Weight</CardTitle>
            <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.slaughter_weight || 0), 0) / displayReports.length).toFixed(1) : '0.0'} kg
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Per animal</p>
          </CardContent>
        </Card>
      </div>

      {/* Export and Actions */}
      {/* Export button moved to header */}

      {/* Reports List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete history of all slaughter transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {displayReports.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">No slaughter reports found</p>
              <Button asChild className="h-9 sm:h-10 text-sm sm:text-base">
                <Link href="/protected/reports/slaughter/new">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  Create your first report
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Animal ID</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Slaughter Wt.</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Carcass Wt.</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Carcass %</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayReports.map((report: SlaughterReport, index: number) => (
                      <tr key={report.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700 font-medium">
                          {displayReports.length - index}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {format(new Date(report.slaughter_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="font-mono text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {report.animals?.animal_id || report.animal_id}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          <span className="font-semibold">{report.slaughter_weight}</span> kg
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          <span className="font-semibold">{report.carcass_weight}</span> kg
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {report.carcass_percentage?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600">
                          ${report.selling_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      {reportsError && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Database Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{reportsError.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}