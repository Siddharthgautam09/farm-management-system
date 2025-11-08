import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/lib/types/database.types'
import { ExportButton } from '@/components/reports/ExportButton'

type DeathReport = Database['public']['Tables']['death_reports']['Row']

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

  // Calculate total loss
  const totalLoss = displayReports.reduce((sum: number, r: any) => 
    sum + (r.animals?.purchase_price || 0), 0
  )

  // Prepare export data
  const exportData = displayReports.map((report: any) => ({
    'Animal ID': report.animals?.animal_id || report.animal_id,
    'Date': format(new Date(report.death_date), 'yyyy-MM-dd'),
    'Cause': report.cause_of_death || '',
    'Purchase Price': report.animals?.purchase_price || 0,
    'Notes': report.notes || '',
  }))

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Death Reports</h1>
          <p className="text-muted-foreground">Track and manage animal mortality</p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={exportData} 
            filename="death-reports"
          />
          <Button asChild>
            <Link href="/protected/reports/death/new">
              <Plus className="mr-2 h-4 w-4" />
              New Death Report
            </Link>
          </Button>
        </div>
      </div>

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
            <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalLoss.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${displayReports.length > 0 ? (totalLoss / displayReports.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayReports.filter((r: any) => {
                const reportDate = new Date(r.death_date)
                const now = new Date()
                return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {displayReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No death reports found</p>
              <Button asChild>
                <Link href="/protected/reports/death/new">Create your first report</Link>
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
                    <th className="text-left p-2">Cause of Death</th>
                    <th className="text-left p-2">Purchase Price</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {displayReports.map((report: any, index: number) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{format(new Date(report.death_date), 'MMM dd, yyyy')}</td>
                      <td className="p-2 font-mono text-sm">{report.animals?.animal_id || report.animal_id}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{report.cause_of_death}</span>
                      </td>
                      <td className="p-2 text-red-600 font-semibold">${report.animals?.purchase_price?.toFixed(2) || '0.00'}</td>
                      <td className="p-2 text-gray-600 max-w-xs truncate">{report.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
