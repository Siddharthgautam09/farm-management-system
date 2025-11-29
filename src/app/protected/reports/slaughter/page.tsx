import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Scale, Package, Search, Filter, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/lib/types/database.types'
import { ExportButton } from '@/components/reports/SlaughterExportButton'
import { SlaughterReportsClient } from '@/components/reports/SlaughterReportsClient'

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
        animal_id,
        category
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

  // Transform reports to match expected types (convert null to undefined)
  const transformedReports = displayReports.map(report => ({
    ...report,
    carcass_percentage: report.carcass_percentage ?? undefined,
    selling_price: report.selling_price ?? undefined,
  }))

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

      {/* Quick Stats - Dashboard Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{displayReports.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.selling_price || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Yield</p>
              <p className="text-2xl font-bold text-blue-600">
                {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.carcass_percentage || 0), 0) / displayReports.length).toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Weight</p>
              <p className="text-2xl font-bold text-purple-600">
                {displayReports.length > 0 ? (displayReports.reduce((sum: number, r: SlaughterReport) => sum + (r.slaughter_weight || 0), 0) / displayReports.length).toFixed(1) : '0.0'}kg
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      {/* Export button moved to header */}

      {/* Reports List with Filters */}
      <SlaughterReportsClient reports={transformedReports} />

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