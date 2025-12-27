'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays, format } from 'date-fns'

export type VaccineLogData = {
  animal_id: string
  room_id: string
  stage_id: string
  vaccine_name: string
  vaccine_volume?: number
  vaccine_dose: number
  vaccine_price?: number
  first_dose_date?: string
  second_dose_date?: string
  second_dose_days_gap?: number
  batch_from_animal_id?: string
  batch_to_animal_id?: string
  purchase_date?: string
}

export async function addVaccineLog(data: VaccineLogData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Auto-calculate second dose date if gap is provided
  let secondDoseDate = data.second_dose_date
  if (!secondDoseDate && data.first_dose_date && data.second_dose_days_gap) {
    const firstDate = new Date(data.first_dose_date)
    const secondDate = addDays(firstDate, data.second_dose_days_gap)
    secondDoseDate = format(secondDate, 'yyyy-MM-dd')
  }

  const { data: vaccineLog, error } = await supabase
    .from('vaccine_logs')
    .insert({
      ...data,
      second_dose_date: secondDoseDate,
      administered_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Refresh animals and cost analysis pages
  revalidatePath('/protected/animals')
  revalidatePath('/protected/reports/cost-analysis')
  return { success: true, vaccine: vaccineLog }
}

export async function getVaccineLogsByAnimal(animalId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vaccine_logs')
    .select(`
      *,
      room:rooms(identifier),
      stage:stages(display_name)
    `)
    .eq('animal_id', animalId)
    .order('first_dose_date', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function calculateVaccineCosts(animalId: string) {
  const supabase = await createClient()
  
  const { data: logs } = await supabase
    .from('vaccine_logs')
    .select('*')
    .eq('animal_id', animalId)

  if (!logs) {
    return { data: null }
  }

  const calculations = logs.map(log => {
    // Vaccine dose cost = Vaccine Price / Vaccine Volume
    const vaccineDoseCost = log.vaccine_volume && log.vaccine_volume > 0 
      ? (log.vaccine_price || 0) / log.vaccine_volume 
      : 0

    // Total cost (assuming 2 doses if second dose exists)
    const numberOfDoses = log.second_dose_date ? 2 : 1
  const totalCost = (log.vaccine_dose ?? 0) * vaccineDoseCost * numberOfDoses

    return {
      ...log,
      vaccineDoseCost,
      numberOfDoses,
      totalCost,
    }
  })

  const totalCost = calculations.reduce((sum, log) => sum + log.totalCost, 0)

  return { 
    data: calculations,
    totalCost 
  }
}

export async function getUpcomingVaccinations() {
  const supabase = await createClient()
  
  const today = new Date()
  const nextWeek = addDays(today, 7)

  const { data, error } = await supabase
    .from('vaccine_logs')
    .select(`
      *,
      animal:animals(animal_id)
    `)
    .gte('second_dose_date', format(today, 'yyyy-MM-dd'))
    .lte('second_dose_date', format(nextWeek, 'yyyy-MM-dd'))
    .order('second_dose_date', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function deleteVaccineLog(logId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('vaccine_logs')
    .delete()
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/vaccine')
  return { success: true }
}
