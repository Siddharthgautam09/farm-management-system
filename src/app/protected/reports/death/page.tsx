import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDeathReports, getDeathStatistics } from '@/actions/death'
import { getDeathReportsForExport } from '@/actions/exports'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/common/ExportButton'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DeathReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reportsResult = await getDeathReports()
  const statistics = await getDeathStatistics();
  const exportResult = await getDeathReportsForExport()

  if ('error' in statistics) {
    return <div>Error loading death statistics: {statistics.error}</div>;
  }

  const reports = reportsResult.data || []
  const exportData = exportResult.data || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Death Reports</h1>
          <p className="text-gray-600 mt-2">
            Track animal mortality and causes
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={exportData}
            filename="death_reports"
            sheetName="Death Reports"
          />
          <Button asChild>
            <Link href="/reports/death/new">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Deaths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {statistics.totalDeaths}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Weight at Death
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statistics.averageWeight.toFixed(1)} kg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Financial Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              ${statistics.totalLoss.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(statistics.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="capitalize">{category}:</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Death Records</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No death reports yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Animal ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Weight</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Financial Loss</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(new Date(report.death_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.animal?.animal_id || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.animal?.category || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.last_weight ? `${report.last_weight} kg` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.cause_of_death || '-'}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        ${report.animal?.purchase_price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
