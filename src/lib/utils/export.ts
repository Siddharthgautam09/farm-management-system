import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportToExcel(data: Record<string, unknown>[], filename: string, sheetName: string) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Get column headers from first object
  const headers = Object.keys(data[0])
  worksheet.addRow(headers)

  // Style header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  // Add data rows
  data.forEach((item) => {
    const row = headers.map((header) => item[header])
    worksheet.addRow(row)
  })

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = Math.max(12, column.header.length + 2)
    }
  })

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
}
