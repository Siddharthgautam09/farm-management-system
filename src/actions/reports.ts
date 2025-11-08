'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type DeathReportData = {
  animal_id: string
  death_date: string
  cause: string
  notes?: string
}

export async function createDeathReport(data: DeathReportData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get animal info
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, animal_id, purchase_price')
      .eq('id', data.animal_id)
      .single()

    if (animalError || !animal) {
      return { error: 'Animal not found' }
    }

    // Create death report
    const { data: report, error: reportError } = await supabase
      .from('death_reports')
      .insert({
        animal_id: data.animal_id,
        death_date: data.death_date,
        cause_of_death: data.cause,
        notes: data.notes || null,
        reported_by: user.id,
      })
      .select()
      .single()

    if (reportError) {
      console.error('Death report creation error:', reportError)
      return { error: reportError.message }
    }

    // Mark animal as deceased
    const { error: updateError } = await supabase
      .from('animals')
      .update({
        is_alive: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.animal_id)

    if (updateError) {
      console.error('Failed to mark animal as deceased:', updateError)
    }

    revalidatePath('/reports/death')
    revalidatePath('/protected/reports/death')
    revalidatePath('/dashboard')
    
    return { success: true, report }
  } catch (error) {
    return { error: 'Failed to create death report: ' + String(error) }
  }
}
