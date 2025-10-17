'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AnimalFormData = {
  animal_id: string
  category: 'beef' | 'camel' | 'sheep' | 'goat'
  incoming_company?: string
  entry_date: string
  old_calf_number?: string
  entry_weight?: number
  age_months?: number
  purchase_price?: number
  initial_room_id: string
  initial_stage_id: string
}

export async function createAnimal(data: AnimalFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Insert animal
  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .insert({
      animal_id: data.animal_id,
      category: data.category,
      incoming_company: data.incoming_company,
      entry_date: data.entry_date,
      old_calf_number: data.old_calf_number,
      entry_weight: data.entry_weight,
      age_months: data.age_months,
      purchase_price: data.purchase_price,
      current_stage_id: data.initial_stage_id,
      current_room_id: data.initial_room_id,
    })
    .select()
    .single()

  if (animalError) {
    return { error: animalError.message }
  }

  // Create initial movement record
  await supabase.from('animal_movements').insert({
    animal_id: animal.id,
    to_stage_id: data.initial_stage_id,
    to_room_id: data.initial_room_id,
    moved_by: user.id,
  })

  // Update room count
  await supabase.rpc('increment_room_count', { room_id: data.initial_room_id })

  revalidatePath('/dashboard')
  return { success: true, animal }
}

export async function moveAnimal(
  animalId: string,
  toStageId: string,
  toRoomId: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get current animal location
  const { data: animal } = await supabase
    .from('animals')
    .select('current_stage_id, current_room_id')
    .eq('id', animalId)
    .single()

  if (!animal) {
    return { error: 'Animal not found' }
  }

  // Create movement record
  await supabase.from('animal_movements').insert({
    animal_id: animalId,
    from_stage_id: animal.current_stage_id,
    from_room_id: animal.current_room_id,
    to_stage_id: toStageId,
    to_room_id: toRoomId,
    moved_by: user.id,
  })

  // Update animal location
  await supabase
    .from('animals')
    .update({
      current_stage_id: toStageId,
      current_room_id: toRoomId,
    })
    .eq('id', animalId)

  // Update room counts
  if (animal.current_room_id) {
    await supabase.rpc('decrement_room_count', { 
      room_id: animal.current_room_id 
    })
  }
  await supabase.rpc('increment_room_count', { room_id: toRoomId })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getAnimalById(animalId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      current_stage:stages!current_stage_id(*),
      current_room:rooms!current_room_id(*),
      movements:animal_movements(*),
      weights:weight_records(*),
      medicines:medicine_logs(*),
      vaccines:vaccine_logs(*),
      feeding:feeding_logs(*)
    `)
    .eq('animal_id', animalId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function searchAnimals(query: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('animals')
    .select('*, current_stage:stages(*), current_room:rooms(*)')
    .ilike('animal_id', `%${query}%`)
    .limit(10)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
