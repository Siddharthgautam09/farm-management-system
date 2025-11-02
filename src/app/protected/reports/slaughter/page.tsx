import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ExportButton } from '@/components/reports/ExportButton'
import SlaughterTransactionsList from '@/components/reports/SlaughterTransactionsList'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SlaughterReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all slaughter reports with fresh data
  const { data: reports, error: reportsError } = await supabase
    .from('slaughter_reports')
    .select(`
      id,
      animal_id,
      slaughter_date,
      slaughter_weight,
      carcass_weight,
      carcass_percentage,
      selling_price,
      created_at,
      created_by,
      animal:animals(animal_id, category)
    `)
    .order('slaughter_date', { ascending: false })

  // Also try a simple query without joins to see if that works
  const { data: simpleReports, error: simpleError } = await supabase
    .from('slaughter_reports')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('Simple reports query (no joins):', { simpleReports, simpleError, count: simpleReports?.length })

  // Debug logging
  console.log('=== SLAUGHTER REPORTS PAGE LOAD ===')
  console.log('Page load timestamp:', new Date().toISOString())
  console.log('Reports query result:', { reports, reportsError, count: reports?.length })
  console.log('User authenticated:', !!user)
  console.log('Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  // Log individual reports for debugging
  if (reports && reports.length > 0) {
    console.log('Sample report data:', reports[0])
    reports.forEach((report, index) => {
      console.log(`Report ${index + 1}:`, {
        id: report.id,
        animal_id: report.animal_id,
        animal_data: report.animal,
        slaughter_date: report.slaughter_date,
        selling_price: report.selling_price
      })
    })
  }

  // Show error if query failed
  if (reportsError) {
    console.error('Database query error:', reportsError)
    console.error('Error details:', {
      message: reportsError.message,
      details: reportsError.details,
      hint: reportsError.hint,
      code: reportsError.code
    })
  }

  // Use only real reports from database
  const displayReports = reports || []

  // Test query to check if we can access any tables
  const { data: animalsTest, error: animalsError } = await supabase
    .from('animals')
    .select('id, animal_id')
    .limit(5)

  console.log('Animals test query:', { animalsTest, animalsError })

  // Prepare export data
  const exportData = displayReports?.map(report => ({
    'Animal ID': report.animal?.animal_id || '',
    'Date': format(new Date(report.slaughter_date), 'yyyy-MM-dd'),
    'Slaughter Weight (kg)': report.slaughter_weight,
    'Carcass Weight (kg)': report.carcass_weight,
    'Carcass %': report.carcass_percentage?.toFixed(2) || '',
    'Selling Price': report.selling_price,
  })) || []

  return (
    <div className="space-y-6">
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Debug Information - {new Date().toLocaleTimeString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Reports from DB:</strong> {reports?.length || 0}
              </div>
              <div>
                <strong>Simple Reports:</strong> {simpleReports?.length || 0}
              </div>
              <div>
                <strong>Has Error:</strong> {reportsError ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Simple Error:</strong> {simpleError ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>User ID:</strong> {user?.id?.substring(0, 8)}...
              </div>
              <div>
                <strong>Display Reports:</strong> {displayReports?.length || 0}
              </div>
              <div>
                <strong>Animals Test:</strong> {animalsTest?.length || 0}
              </div>
              <div>
                <strong>Animals Error:</strong> {animalsError ? 'Yes' : 'No'}
              </div>
            </div>
            {reportsError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-800">
                <strong>Reports Error:</strong> {reportsError.message}
              </div>
            )}
            {simpleError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-800">
                <strong>Simple Error:</strong> {simpleError.message}
              </div>
            )}
            {animalsError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-800">
                <strong>Animals Error:</strong> {animalsError.message}
              </div>
            )}
            {simpleReports && simpleReports.length > 0 && (
              <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800">
                <strong>Latest Report:</strong> ID: {simpleReports[0].id}, Animal: {simpleReports[0].animal_id}, Date: {simpleReports[0].slaughter_date}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slaughter House Reports</h1>
          <p className="text-gray-600 mt-2">
            Track animal sales and carcass information
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={exportData} 
            filename="slaughter-reports" 
            disabled={!displayReports || displayReports.length === 0}
          />
          <Button asChild>
            <Link href="/protected/reports/slaughter/new">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {displayReports && displayReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{displayReports.length}</p>
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
                ${displayReports.reduce((sum, r) => sum + (r.selling_price || 0), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Carcass %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {displayReports.length > 0 ? (displayReports.reduce((sum, r) => sum + (r.carcass_percentage || 0), 0) / displayReports.length).toFixed(1) : '0.0'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {displayReports.length > 0 ? (displayReports.reduce((sum, r) => sum + (r.slaughter_weight || 0), 0) / displayReports.length).toFixed(1) : '0.0'} kg
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Transactions List with Filters */}
      <SlaughterTransactionsList reports={displayReports || []} />
    </div>
  )
}
