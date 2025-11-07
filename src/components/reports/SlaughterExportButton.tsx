'use client'

import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type ExportData = {
  'Animal ID': string
  'Date': string
  'Slaughter Weight (kg)': number
  'Carcass Weight (kg)': number
  'Carcass %': string
  'Selling Price': number | null
}

type ExportButtonProps = {
  data: ExportData[]
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [Object.keys(data[0]), ...data.map(row => Object.values(row))]
        .map(e => e.join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `slaughter_reports_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.click()
  }

  return (
    <Button onClick={handleExport}>
      Export to CSV
    </Button>
  )
}