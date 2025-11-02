import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function SlaughterReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all slaughter reports
  const { data: reports } = await supabase
    .from('slaughter_reports')
    .select(`
      *,
      animal:animals(animal_id, category)
    `)
    .order('slaughter_date', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slaughter House Reports</h1>
          <p className="text-gray-600 mt-2">
            Track animal sales and carcass information
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/reports/slaughter/new">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {reports && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reports.length}</p>
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
                ${reports.reduce((sum, r) => sum + (r.selling_price || 0), 0).toFixed(2)}
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
                {(reports.reduce((sum, r) => sum + (r.carcass_percentage || 0), 0) / reports.length).toFixed(1)}%
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
                {(reports.reduce((sum, r) => sum + (r.slaughter_weight || 0), 0) / reports.length).toFixed(1)} kg
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Slaughter Reports</CardTitle>
          <CardDescription>
            Complete list of slaughter transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Animal ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Slaughter Weight</th>
                    <th className="px-6 py-3">Carcass Weight</th>
                    <th className="px-6 py-3">Carcass %</th>
                    <th className="px-6 py-3">Selling Price</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {report.animal?.animal_id}
                      </td>
                      <td className="px-6 py-4">
                        {format(new Date(report.slaughter_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {report.slaughter_weight} kg
                      </td>
                      <td className="px-6 py-4">
                        {report.carcass_weight} kg
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {report.carcass_percentage?.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ${report.selling_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/reports/slaughter/${report.id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No slaughter reports yet</p>
              <Button asChild>
                <Link href="/reports/slaughter/new">
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
