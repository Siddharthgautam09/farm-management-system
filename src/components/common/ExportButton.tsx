'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel, exportToCSV } from '@/lib/utils/export'
import { useToast } from '@/hooks/use-toast'

type ExportButtonProps = {
  data: Record<string, unknown>[]
  filename: string
  sheetName: string
  disabled?: boolean
}

export function ExportButton({ data, filename, sheetName, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  async function handleExport(format: 'excel' | 'csv') {
    if (data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There is no data to export',
      })
      return
    }

    setIsExporting(true)
    try {
      if (format === 'excel') {
        await exportToExcel(data, filename, sheetName)
      } else {
        exportToCSV(data, filename)
      }
      
      toast({
        title: 'Success',
        description: `Data exported to ${format.toUpperCase()} successfully`,
      })
  } catch {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
