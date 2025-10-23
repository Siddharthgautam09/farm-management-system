'use server'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function getAnimalsForExport() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('animals')
    .select(`
      animal_id,
      category,
      incoming_company,
      entry_date,
      entry_weight,
      age_months,
      purchase_price,
      is_alive,
      is_sold,
      current_stage:stages!current_stage_id(display_name),
      current_room:rooms!current_room_id(identifier)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Transform for export
  const exportData = data.map((animal) => ({
    'Animal ID': animal.animal_id,
    'Category': animal.category,
    'Company': animal.incoming_company || '-',
    'Entry Date': format(new Date(animal.entry_date), 'yyyy-MM-dd'),
    'Entry Weight (kg)': animal.entry_weight || '-',
    'Age (months)': animal.age_months || '-',
    'Purchase Price': animal.purchase_price || '-',
    'Current Stage': animal.current_stage?.display_name || '-',
    'Current Room': animal.current_room?.identifier || '-',
    'Status': animal.is_alive ? (animal.is_sold ? 'Sold' : 'Alive') : 'Deceased',
  }))

  return { data: exportData }
}

export async function getSlaughterReportsForExport(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('slaughter_reports')
    .select(`
      slaughter_date,
      slaughter_weight,
      carcass_weight,
      carcass_percentage,
      selling_price,
      animal:animals(animal_id, category, purchase_price)
    `)
    .order('slaughter_date', { ascending: false })

  if (startDate) query = query.gte('slaughter_date', startDate)
  if (endDate) query = query.lte('slaughter_date', endDate)

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  const exportData = data.map((report) => ({
    'Date': format(new Date(report.slaughter_date), 'yyyy-MM-dd'),
    'Animal ID': report.animal?.animal_id || '-',
    'Category': report.animal?.category || '-',
    'Slaughter Weight (kg)': report.slaughter_weight,
    'Carcass Weight (kg)': report.carcass_weight,
    'Carcass %': report.carcass_percentage?.toFixed(2) || '-',
    'Selling Price': report.selling_price || '-',
    'Purchase Price': report.animal?.purchase_price || '-',
    'Profit/Loss': report.selling_price && report.animal?.purchase_price 
      ? (report.selling_price - report.animal.purchase_price).toFixed(2)
      : '-',
  }))

  return { data: exportData }
}

export async function getDeathReportsForExport(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('death_reports')
    .select(`
      death_date,
      last_weight,
      cause_of_death,
      notes,
      animal:animals(animal_id, category, entry_date, purchase_price)
    `)
    .order('death_date', { ascending: false })

  if (startDate) query = query.gte('death_date', startDate)
  if (endDate) query = query.lte('death_date', endDate)

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  const exportData = data.map((report) => ({
    'Date': format(new Date(report.death_date), 'yyyy-MM-dd'),
    'Animal ID': report.animal?.animal_id || '-',
    'Category': report.animal?.category || '-',
    'Last Weight (kg)': report.last_weight || '-',
    'Cause of Death': report.cause_of_death || '-',
    'Financial Loss': report.animal?.purchase_price || '-',
    'Days on Farm': report.animal?.entry_date 
      ? Math.floor((new Date(report.death_date).getTime() - new Date(report.animal.entry_date).getTime()) / (1000 * 60 * 60 * 24))
      : '-',
    'Notes': report.notes || '-',
  }))

  return { data: exportData }
}

export async function getWeightRecordsForExport(animalId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('weight_records')
    .select(`
      recorded_date,
      weight,
      weight_sequence,
      notes,
      animal:animals(animal_id),
      stage:stages(display_name),
      room:rooms(identifier)
    `)
    .order('recorded_date', { ascending: false })

  if (animalId) {
    query = query.eq('animal_id', animalId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  const exportData = data.map((record) => ({
    'Animal ID': record.animal?.animal_id || '-',
    'Date': format(new Date(record.recorded_date), 'yyyy-MM-dd'),
    'Weight (kg)': record.weight,
    'Sequence': record.weight_sequence || '-',
    'Stage': record.stage?.display_name || '-',
    'Room': record.room?.identifier || '-',
    'Notes': record.notes || '-',
  }))

  return { data: exportData }
}
