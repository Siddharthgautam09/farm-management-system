import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSlaughterReports, getSlaughterStatistics } from '@/actions/slaughter'
import { getSlaughterReportsForExport } from '@/actions/exports'
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

export default async function SlaughterReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reportsResult = await getSlaughterReports()
  const statistics = await getSlaughterStatistics()
  const exportResult = await getSlaughterReportsForExport()

  const reports = reportsResult.data || []
  const exportData = exportResult.data || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Slaughter House Reports</h1>
          <p className="text-gray-600 mt-2">
            Track animals sold and carcass clearance ratios
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={exportData}
            filename="slaughter_reports"
            sheetName="Slaughter Reports"
          />
          <Button asChild>
            <Link href="/reports/slaughter/new">
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
              Total Animals Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics.totalAnimals}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Carcass %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {(statistics.averageCarcassPercentage ?? 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ${ (statistics.totalRevenue ?? 0).toFixed(2) }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Selling Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${ (statistics.averageSellingPrice ?? 0).toFixed(2) }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Slaughter Records</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No slaughter reports yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Animal ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Slaughter Weight</TableHead>
                    <TableHead>Carcass Weight</TableHead>
                    <TableHead>Carcass %</TableHead>
                    <TableHead>Selling Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(new Date(report.slaughter_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.animal?.animal_id || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.animal?.category || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.slaughter_weight} kg</TableCell>
                      <TableCell>{report.carcass_weight} kg</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            (report.carcass_percentage || 0) >= 55 
                              ? 'default' 
                              : 'secondary'
                          }
                        >
                          {report.carcass_percentage?.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {report.selling_price 
                          ? `$${report.selling_price.toFixed(2)}` 
                          : '-'}
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
