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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

type MedicineLog = {
  id: string
  drug_company: string | null
  drug_name: string
  drug_type: string
  drug_dose: number | null  // Changed to nullable
  treatment_days: number | null
  treatment_start_date: string | null
  illness: string | null
  drugDoseCost?: number
  drugConsuming?: number
  treatmentCost?: number
  quantity_remaining: number | null
}

type MedicineHistoryProps = {
  logs: MedicineLog[]
  totalCost?: number
}

const drugTypeLabels: Record<string, string> = {
  ml: 'ML',
  tablet: 'Tablet',
  gram: 'Gram',
  injection: 'Injection',
}

export function MedicineHistory({ logs, totalCost }: MedicineHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No medicine records yet
      </div>
    )
  }

  // Check for low stock medicines
  const lowStockMedicines = logs.filter(log => 
    log.quantity_remaining !== null && log.quantity_remaining < 5
  )

  return (
    <div className="space-y-4">
      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockMedicines.length} medicine(s)</strong> are running low on stock (below 5 units)
          </AlertDescription>
        </Alert>
      )}

      {/* Medicine Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Drug Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Total Consumed</TableHead>
              <TableHead>Treatment Cost</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Illness</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {log.treatment_start_date 
                    ? format(new Date(log.treatment_start_date), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="font-medium">{log.drug_name}</TableCell>
                <TableCell>{log.drug_company || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {drugTypeLabels[log.drug_type] || log.drug_type}
                  </Badge>
                </TableCell>
                <TableCell>{log.drug_dose || '-'}</TableCell>
                <TableCell>{log.treatment_days || '-'}</TableCell>
                <TableCell className="font-medium">
                  {log.drugConsuming?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  ${log.treatmentCost?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>
                  {log.quantity_remaining !== null ? (
                    <Badge 
                      variant={log.quantity_remaining < 5 ? 'destructive' : 'secondary'}
                    >
                      {log.quantity_remaining}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {log.illness || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Total Cost Summary */}
      {totalCost !== undefined && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Total Medicine Cost for this Animal
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
