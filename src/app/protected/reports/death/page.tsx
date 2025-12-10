import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import { Skull, DollarSign, TrendingDown, Calendar, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/lib/types/database.types'
import { ExportButton } from '@/components/reports/ExportButton'
import { AddDeathReportModal } from '@/components/reports/AddDeathReportModal'

type DeathReport = Database['public']['Tables']['death_reports']['Row'] & {
  animals?: {
    animal_id: string
    purchase_price: number | null
  } | null
}

// Force dynamic rendering - absolutely no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function DeathReportsPage() {
  console.log('=== DEATH REPORTS PAGE RENDER ===')
  console.log('Timestamp:', new Date().toISOString())
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log(' User not authenticated, redirecting to login')
    redirect('/auth/login')
  }

  console.log(' User authenticated:', user.id)

  // Fetch death reports with animal details
  console.log(' Fetching death reports from database...')
  
  const { data: reports, error: reportsError } = await supabase
    .from('death_reports')
    .select(`
      *,
      animals (
        animal_id,
        purchase_price
      )
    `)
    .order('created_at', { ascending: false })

  console.log(' Query Results:')
  console.log('- Reports count:', reports?.length || 0)
  console.log('- Query error:', reportsError?.message || 'none')

  if (reportsError) {
    console.error('Database query error:', reportsError)
  }

  const displayReports = reports || []

  // Fetch animals for the modal
  const { data: animals } = await supabase
    .from('animals')
    .select('id, animal_id, category')
    .order('animal_id')

  // Calculate total loss
  const totalLoss = displayReports.reduce((sum: number, r: DeathReport) => 
    sum + (r.animals?.purchase_price || 0), 0
  )

  // Prepare export data
  const exportData = displayReports.map((report: DeathReport) => ({
    'Animal ID': report.animals?.animal_id || report.animal_id,
    'Date': format(new Date(report.death_date), 'yyyy-MM-dd'),
    'Cause': report.cause_of_death || '',
    'Purchase Price': report.animals?.purchase_price || 0,
    'Notes': report.notes || '',
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Death Reports</h1>
          </div>
          <div className="w-9 sm:w-10 shrink-0" />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs sm:text-sm text-muted-foreground">Track and manage animal mortality</p>
          <div className="flex gap-2 shrink-0">
            <ExportButton 
              data={exportData} 
              filename="death-reports"
            />
            <AddDeathReportModal animals={animals || []} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                  Total Reports
                </p>
                <p className="text-xl sm:text-2xl font-bold">{displayReports.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                  Total Loss
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  ${totalLoss.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                  Avg Loss
                </p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  ${displayReports.length > 0 ? (totalLoss / displayReports.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 h-20 sm:h-24 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                  This Month
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {displayReports.filter((r: DeathReport) => {
                    const reportDate = new Date(r.death_date)
                    const now = new Date()
                    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete history of all mortality incidents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {displayReports.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Skull className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">No death reports found</p>
              <AddDeathReportModal animals={animals || []} />
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
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cause</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Loss</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayReports.map((report: DeathReport, index: number) => (
                      <tr key={report.id} className="hover:bg-red-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700 font-medium">
                          {displayReports.length - index}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {format(new Date(report.death_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="font-mono text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {report.animals?.animal_id || report.animal_id}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {report.cause_of_death}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-red-600">
                          ${report.animals?.purchase_price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                          {report.notes || '-'}
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
