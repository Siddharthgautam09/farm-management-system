'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type DeathReportData = {
  animal_id: string
  death_date: string
  last_weight?: number
  cause_of_death?: string
  notes?: string
}

export async function createDeathReport(data: DeathReportData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Mark animal as not alive
  const { error: animalError } = await supabase
    .from('animals')
    .update({ is_alive: false })
    .eq('id', data.animal_id)

  if (animalError) {
    return { error: animalError.message }
  }

  // Create death report
  const { data: report, error } = await supabase
    .from('death_reports')
    .insert({
      ...data,
      reported_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/reports/death')
  return { success: true, report }
}

export async function getDeathReports(filters?: {
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('death_reports')
    .select(`
      *,
      animal:animals(animal_id, category, entry_date, purchase_price)
    `)
    .order('death_date', { ascending: false })

  if (filters?.startDate) {
    query = query.gte('death_date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('death_date', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getDeathStatistics(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('death_reports')
    .select(`
      *,
      animal:animals(category, purchase_price)
    `)

  if (startDate) query = query.gte('death_date', startDate)
  if (endDate) query = query.lte('death_date', endDate)

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    return {
      totalDeaths: 0,
      averageWeight: 0,
      totalLoss: 0,
      byCategory: {},
    }
  }

  const statistics = {
    totalDeaths: data.length,
    averageWeight: data.filter(r => r.last_weight).reduce((sum, r) => sum + (r.last_weight || 0), 0) / data.filter(r => r.last_weight).length || 0,
    totalLoss: data.reduce((sum, r) => sum + (r.animal?.purchase_price || 0), 0),
    byCategory: data.reduce((acc: Record<string, number>, r) => {
      const category = r.animal?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }

  return statistics
}

export async function deleteDeathReport(reportId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('death_reports')
    .delete()
    .eq('id', reportId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/reports/death')
  return { success: true }
}
