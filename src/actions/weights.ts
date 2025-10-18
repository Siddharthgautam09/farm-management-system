'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type WeightRecordData = {
  animal_id: string
  stage_id: string
  room_id: string
  weight: number
  recorded_date: string
  notes?: string
}

export async function addWeightRecord(data: WeightRecordData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get current weight sequence for this animal in this stage
  const { data: existingWeights } = await supabase
    .from('weight_records')
    .select('weight_sequence')
    .eq('animal_id', data.animal_id)
    .eq('stage_id', data.stage_id)
    .order('weight_sequence', { ascending: false })
    .limit(1)

  const nextSequence = existingWeights && existingWeights.length > 0 
    ? (existingWeights[0].weight_sequence || 0) + 1 
    : 1

  const { data: weightRecord, error } = await supabase
    .from('weight_records')
    .insert({
      animal_id: data.animal_id,
      stage_id: data.stage_id,
      room_id: data.room_id,
      weight: data.weight,
      recorded_date: data.recorded_date,
      weight_sequence: nextSequence,
      notes: data.notes,
      recorded_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/animals/${data.animal_id}`)
  return { success: true, weight: weightRecord }
}

export async function getWeightHistory(animalId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('weight_records')
    .select(`
      *,
      stage:stages(display_name),
      room:rooms(identifier),
      recorded_by_user:profiles(full_name, email)
    `)
    .eq('animal_id', animalId)
    .order('recorded_date', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getWeightsByStage(animalId: string, stageId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('weight_records')
    .select('*')
    .eq('animal_id', animalId)
    .eq('stage_id', stageId)
    .order('weight_sequence', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function deleteWeightRecord(weightId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('weight_records')
    .delete()
    .eq('id', weightId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/animals')
  return { success: true }
}
