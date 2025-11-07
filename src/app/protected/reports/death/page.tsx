import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ExportButton } from '@/components/reports/ExportButton'

export default async function DeathReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all death reports
  const { data: reports } = await supabase
    .from('death_reports')
    .select(`
      *,
      animal:animals(animal_id, category, purchase_price)
    `)
    .order('death_date', { ascending: false })

  // Calculate total loss
  const totalLoss = reports?.reduce((sum, r) => 
    sum + (r.animal?.purchase_price || 0), 0
  ) || 0

  // Prepare export data
  const exportData = reports?.map(report => ({
    'Animal ID': report.animal?.animal_id || '',
    'Date': format(new Date(report.death_date), 'yyyy-MM-dd'),
    'Cause': report.cause,
    'Purchase Price': report.animal?.purchase_price || 0,
    'Notes': report.notes || '',
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Death Reports</h1>
          <p className="text-gray-600 mt-2">
            Track animal mortality and causes
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={exportData} 
            filename="death-reports" 
            disabled={!reports || reports.length === 0}
          />
          <Button asChild>
            <Link href="/reports/death/new">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {reports && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Deaths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{reports.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ${totalLoss.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Loss per Animal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${(totalLoss / reports.length).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Death Reports</CardTitle>
          <CardDescription>
            Complete list of animal deaths
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Animal ID</th>
                    <th className="px-6 py-3">Death Date</th>
                    <th className="px-6 py-3">Cause</th>
                    <th className="px-6 py-3">Purchase Price</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {report.animal?.animal_id}
                      </td>
                      <td className="px-6 py-4">
                        {format(new Date(report.death_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="destructive">{report.cause}</Badge>
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold">
                        ${report.animal?.purchase_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {report.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No death reports yet</p>
              <Button asChild variant="outline">
                <Link href="/reports/death/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
