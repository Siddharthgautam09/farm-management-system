'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SlaughterReportData = {
  animal_id: string
  slaughter_date: string
  slaughter_weight: number
  carcass_weight: number
  selling_price: number
  notes?: string
}

export async function createSlaughterReport(data: SlaughterReportData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Calculate carcass percentage
    const carcass_percentage = (data.carcass_weight / data.slaughter_weight) * 100

    // Create slaughter report
    const { data: report, error: reportError } = await supabase
      .from('slaughter_reports')
      .insert({
        animal_id: data.animal_id,
        slaughter_date: data.slaughter_date,
        slaughter_weight: data.slaughter_weight,
        carcass_weight: data.carcass_weight,
        carcass_percentage: carcass_percentage,
        selling_price: data.selling_price,
        notes: data.notes,
      })
      .select()
      .single()

    if (reportError) {
      return { error: reportError.message }
    }

    // Mark animal as sold
    const { error: animalError } = await supabase
      .from('animals')
      .update({
        is_sold: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.animal_id)

    if (animalError) {
      return { error: 'Report created but failed to mark animal as sold' }
    }

    revalidatePath('/reports/slaughter')
    revalidatePath('/dashboard')
    revalidatePath(`/animals/${data.animal_id}`)
    
    return { success: true, report }
  } catch (error) {
    return { error: 'Failed to create slaughter report' }
  }
}
