'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SlaughterReportData = {
  animal_id: string
  slaughter_date: string
  slaughter_weight: number
  carcass_weight: number
  selling_price: number
}

export async function createSlaughterReport(data: SlaughterReportData) {
  console.log('Creating slaughter report with data:', data)
  
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Authentication required' }
    }

    // Calculate carcass percentage
    const carcass_percentage = (data.carcass_weight / data.slaughter_weight) * 100

    console.log('Attempting to insert slaughter report:', {
      animal_id: data.animal_id,
      slaughter_date: data.slaughter_date,
      slaughter_weight: data.slaughter_weight,
      carcass_weight: data.carcass_weight,
      carcass_percentage,
      selling_price: data.selling_price,
      created_by: user.id
    })

    // Insert the slaughter report
    const { data: report, error } = await supabase
      .from('slaughter_reports')
      .insert({
        animal_id: data.animal_id,
        slaughter_date: data.slaughter_date,
        slaughter_weight: data.slaughter_weight,
        carcass_weight: data.carcass_weight,
        carcass_percentage,
        selling_price: data.selling_price,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { error: 'Failed to create slaughter report: ' + error.message }
    }

    console.log('Slaughter report created successfully:', report)

    // Revalidate all related paths aggressively
    try {
      revalidatePath('/protected/reports/slaughter', 'page')
      revalidatePath('/protected/reports', 'page')
      revalidatePath('/protected', 'layout')
      revalidatePath('/', 'layout')
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError)
    }
    
    console.log('Revalidation completed for paths')
    
    return { success: true, report }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to create slaughter report' }
  }
}
