'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type MedicineLogData = {
  animal_id: string
  room_id: string
  stage_id: string
  drug_company?: string
  drug_name: string
  drug_type: 'ml' | 'tablet' | 'gram' | 'injection'
  drug_volume?: number
  drug_price?: number
  drug_dose: number
  treatment_days?: number
  treatment_start_date?: string
  treatment_end_date?: string
  illness?: string
  quantity_remaining?: number
  purchase_date?: string
}

export async function addMedicineLog(data: MedicineLogData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: medicineLog, error } = await supabase
    .from('medicine_logs')
    .insert({
      ...data,
      administered_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/medicine')
  return { success: true, medicine: medicineLog }
}

export async function getMedicineLogsByAnimal(animalId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medicine_logs')
    .select(`
      *,
      room:rooms(identifier),
      stage:stages(display_name)
    `)
    .eq('animal_id', animalId)
    .order('treatment_start_date', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function calculateMedicineCosts(animalId: string) {
  const supabase = await createClient()
  
  const { data: logs } = await supabase
    .from('medicine_logs')
    .select('*')
    .eq('animal_id', animalId)

  if (!logs) {
    return { data: null }
  }

  const calculations = logs.map(log => {
    // Drug dose cost = Drug Price / Drug Volume
    const drugDoseCost = log.drug_volume && log.drug_volume > 0 
      ? (log.drug_price || 0) / log.drug_volume 
      : 0

    // Drug consuming = Drug Dose × Treatment Days
    const drugConsuming = (log.drug_dose ?? 0) * (log.treatment_days || 1)

    // Treatment cost = Drug Consuming × Drug Dose Cost
    const treatmentCost = drugConsuming * drugDoseCost

    return {
      ...log,
      drugDoseCost,
      drugConsuming,
      treatmentCost,
    }
  })

  // Total medicine cost for this animal
  const totalCost = calculations.reduce((sum, log) => sum + log.treatmentCost, 0)

  return { 
    data: calculations,
    totalCost 
  }
}

export async function updateMedicineQuantity(logId: string, quantityRemaining: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medicine_logs')
    .update({ quantity_remaining: quantityRemaining })
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/medicine')
  return { success: true }
}

export async function deleteMedicineLog(logId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medicine_logs')
    .delete()
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/medicine')
  return { success: true }
}

export async function getLowStockMedicines(threshold: number = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medicine_logs')
    .select('*')
    .lte('quantity_remaining', threshold)
    .order('quantity_remaining', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
