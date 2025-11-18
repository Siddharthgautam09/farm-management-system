import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slaughter Reports</h1>
          <p className="text-muted-foreground">Track and manage slaughter transactions</p>
        </div>
        <div className="flex gap-2">
          <ExportButton data={exportData} />
          <Button asChild>
            <Link href="/protected/reports/slaughter/new">
              <Plus className="mr-2 h-4 w-4" />
              New Slaughter Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.selling_price || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Carcass %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.carcass_percentage || 0), 0) / displayReports.length).toFixed(1) : '0.0'}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.slaughter_weight || 0), 0) / displayReports.length).toFixed(1) : '0.0'} kg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export and Actions */}
      {/* Export button moved to header */}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {displayReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No slaughter reports found</p>
              <Button asChild>
                <Link href="/protected/reports/slaughter/new">
                  Create your first report
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">S.No</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Animal ID</th>
                    <th className="text-left p-2">Slaughter Weight</th>
                    <th className="text-left p-2">Carcass Weight</th>
                    <th className="text-left p-2">Carcass %</th>
                    <th className="text-left p-2">Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {displayReports.map((report: SlaughterReport, index: number) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{displayReports.length - index}</td>
                      <td className="p-2">{format(new Date(report.slaughter_date), 'MMM dd, yyyy')}</td>
                      <td className="p-2 font-mono text-sm">{report.animals?.animal_id || report.animal_id}</td>
                      <td className="p-2">{report.slaughter_weight} kg</td>
                      <td className="p-2">{report.carcass_weight} kg</td>
                      <td className="p-2">{report.carcass_percentage?.toFixed(1)}%</td>
                      <td className="p-2">${report.selling_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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