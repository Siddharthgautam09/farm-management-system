'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SlaughterReportData = {
  animal_id: string
  slaughter_date: string
  slaughter_weight: number
  carcass_weight: number
  selling_price?: number
}

export async function createSlaughterReport(data: SlaughterReportData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Mark animal as sold
  const { error: animalError } = await supabase
    .from('animals')
    .update({ 
      is_sold: true,
      is_alive: false 
    })
    .eq('id', data.animal_id)

  if (animalError) {
    return { error: animalError.message }
  }

  // Create slaughter report (carcass_percentage calculated automatically by database)
  const { data: report, error } = await supabase
    .from('slaughter_reports')
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/reports/slaughter')
  return { success: true, report }
}

export async function getSlaughterReports(filters?: {
  startDate?: string
  endDate?: string
  minWeight?: number
  maxWeight?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('slaughter_reports')
    .select(`
      *,
      animal:animals(animal_id, category, entry_date, purchase_price)
    `)
    .order('slaughter_date', { ascending: false })

  if (filters?.startDate) {
    query = query.gte('slaughter_date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('slaughter_date', filters.endDate)
  }
  if (filters?.minWeight) {
    query = query.gte('slaughter_weight', filters.minWeight)
  }
  if (filters?.maxWeight) {
    query = query.lte('slaughter_weight', filters.maxWeight)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getSlaughterStatistics(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('slaughter_reports')
    .select('*')

  if (startDate) query = query.gte('slaughter_date', startDate)
  if (endDate) query = query.lte('slaughter_date', endDate)

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    return {
      totalAnimals: 0,
      averageCarcassPercentage: 0,
      totalRevenue: 0,
      averageSellingPrice: 0,
    }
  }

  const statistics = {
    totalAnimals: data.length,
    averageCarcassPercentage: data.reduce((sum, r) => sum + (r.carcass_percentage || 0), 0) / data.length,
    totalRevenue: data.reduce((sum, r) => sum + (r.selling_price || 0), 0),
    averageSellingPrice: data.reduce((sum, r) => sum + (r.selling_price || 0), 0) / data.length,
  }

  return statistics
}

export async function deleteSlaughterReport(reportId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('slaughter_reports')
    .delete()
    .eq('id', reportId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/reports/slaughter')
  return { success: true }
}
