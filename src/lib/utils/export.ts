import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

type ExportData = Record<string, string | number | null | undefined>

export async function exportToExcel(data: ExportData[], filename: string, sheetName: string = 'Data') {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Add header row with styling
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4B5563' }
  }
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true }

  // Add data rows
  data.forEach((item) => {
    const row = headers.map(header => item[header])
    worksheet.addRow(row)
  })

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? String(cell.value).length : 10
      if (columnLength > maxLength) {
        maxLength = columnLength
      }
    })
    column.width = maxLength < 10 ? 10 : maxLength + 2
  })

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  
  const timestamp = new Date().toISOString().split('T')[0]
  saveAs(blob, `${filename}-${timestamp}.xlsx`)
}

export function exportToCSV(data: ExportData[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        // Handle values that might contain commas
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const timestamp = new Date().toISOString().split('T')[0]
  saveAs(blob, `${filename}-${timestamp}.csv`)
}
