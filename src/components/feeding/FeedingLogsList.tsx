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

type FeedingLog = {
  id: string
  feed_type: string
  company_name: string | null
  item_name: string | null
  daily_use: number | null  // Changed from number to number | null
  date_of_use: string
  dailyCost?: number
  averageConsume?: number
  calfConsumeCost?: number
}

type FeedingLogsListProps = {
  logs: FeedingLog[]
}

const feedTypeLabels: Record<string, string> = {
  mcr: 'MCR',
  concentrated_feed: 'Concentrated Feed',
  alfa_alfa: 'Alfa Alfa',
  hay: 'Hay',
  premix: 'Premix',
}

export function FeedingLogsList({ logs }: FeedingLogsListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No feeding records yet
      </div>
    )
  }

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <div className="min-w-[680px]">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Feed Type</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Daily Use</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.date_of_use), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {feedTypeLabels[log.feed_type] || log.feed_type}
                </Badge>
              </TableCell>
              <TableCell>{log.company_name || '-'}</TableCell>
              <TableCell className="font-medium">
                {log.daily_use?.toFixed(2) || '0.00'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  )
}
