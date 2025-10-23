import { format, isBefore, isAfter, addDays } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, CheckCircle2, Clock } from 'lucide-react'

type VaccineLog = {
  id: string
  vaccine_name: string
  vaccine_dose: number | null  // Changed to nullable
  first_dose_date: string | null
  second_dose_date: string | null
  second_dose_days_gap: number | null
  vaccineDoseCost?: number
  numberOfDoses?: number
  totalCost?: number
  batch_from_animal_id: string | null
  batch_to_animal_id: string | null
}

type VaccineHistoryProps = {
  logs: VaccineLog[]
  totalCost?: number
}

export function VaccineHistory({ logs, totalCost }: VaccineHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No vaccine records yet
      </div>
    )
  }

  // Check for upcoming second doses (within next 3 days)
  const today = new Date()
  const upcomingDoses = logs.filter(log => {
    if (!log.second_dose_date) return false
    const secondDose = new Date(log.second_dose_date)
    const threeDaysFromNow = addDays(today, 3)
    return isAfter(secondDose, today) && isBefore(secondDose, threeDaysFromNow)
  })

  return (
    <div className="space-y-4">
      {/* Upcoming Dose Alert */}
      {upcomingDoses.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Bell className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong className="text-yellow-800">
              {upcomingDoses.length} second dose(s) due soon!
            </strong>
            <div className="mt-2 space-y-1">
              {upcomingDoses.map(log => (
                <div key={log.id} className="text-sm text-yellow-800">
                  • {log.vaccine_name} - {format(new Date(log.second_dose_date!), 'MMM dd, yyyy')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Vaccine Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaccine Name</TableHead>
              <TableHead>First Dose</TableHead>
              <TableHead>Second Dose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dose (ML)</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Batch Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const secondDosePassed = log.second_dose_date 
                ? isBefore(new Date(log.second_dose_date), today)
                : false

              return (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.vaccine_name}</TableCell>
                  <TableCell>
                    {log.first_dose_date 
                      ? format(new Date(log.first_dose_date), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {log.second_dose_date ? (
                      <span className={secondDosePassed ? 'text-gray-600' : 'text-blue-600 font-medium'}>
                        {format(new Date(log.second_dose_date), 'MMM dd, yyyy')}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {log.second_dose_date ? (
                      secondDosePassed ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">Single Dose</Badge>
                    )}
                  </TableCell>
                  <TableCell>{log.vaccine_dose ? `${log.vaccine_dose.toFixed(2)} ML` : '-'}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    ${log.totalCost?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    {log.batch_from_animal_id && log.batch_to_animal_id ? (
                      <span className="text-xs">
                        {log.batch_from_animal_id} → {log.batch_to_animal_id}
                      </span>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Total Cost Summary */}
      {totalCost !== undefined && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Total Vaccine Cost for this Animal
            </span>
            <span className="text-2xl font-bold text-purple-600">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
