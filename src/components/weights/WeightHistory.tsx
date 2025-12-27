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
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type WeightRecord = {
  id: string
  weight: number
  recorded_date: string
  weight_sequence: number | null
  notes: string | null
  stage: {
    display_name: string
  } | null
  room: {
    identifier: string
  } | null
}

type WeightHistoryProps = {
  weights: WeightRecord[]
}

export function WeightHistory({ weights }: WeightHistoryProps) {
  if (weights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No weight records yet
      </div>
    )
  }

  // Calculate weight change
  const getWeightChange = (current: number, previous: number | null) => {
    if (!previous) return null
    const change = current - previous
    const percentage = (change / previous) * 100
    return { change, percentage }
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-x-auto rounded-md border">
        <div className="min-w-[720px]">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Sequence</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weights.map((record, index) => {
              const previousWeight = index > 0 ? weights[index - 1].weight : null
              const change = getWeightChange(record.weight, previousWeight)

              return (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.recorded_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{record.stage?.display_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Room {record.room?.identifier || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {record.weight.toFixed(2)} kg
                  </TableCell>
                  <TableCell>
                    {change ? (
                      <div className="flex items-center gap-1">
                        {change.change > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : change.change < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                        <span
                          className={
                            change.change > 0
                              ? 'text-green-600'
                              : change.change < 0
                              ? 'text-red-600'
                              : 'text-gray-400'
                          }
                        >
                          {change.change > 0 ? '+' : ''}
                          {change.change.toFixed(2)} kg
                          <span className="text-xs ml-1">
                            ({change.percentage > 0 ? '+' : ''}
                            {change.percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.weight_sequence ? (
                      <Badge variant="secondary">#{record.weight_sequence}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.notes || '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          </Table>
        </div>
      </div>

      {/* Weight Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Entry Weight</p>
          <p className="text-2xl font-bold text-blue-600">
            {weights[0]?.weight.toFixed(2)} kg
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Weight</p>
          <p className="text-2xl font-bold text-green-600">
            {weights[weights.length - 1]?.weight.toFixed(2)} kg
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Gain</p>
          <p className="text-2xl font-bold text-purple-600">
            {(
              weights[weights.length - 1]?.weight - weights[0]?.weight
            ).toFixed(2)}{' '}
            kg
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-orange-600">
            {weights.length}
          </p>
        </div>
      </div>
    </div>
  )
}
