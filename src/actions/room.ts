'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRoom(stageId: string, identifier: string, capacity: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      stage_id: stageId,
      identifier: identifier as any,
      capacity,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, room: data }
}

export async function getRoomsByStage(stageName: string) {
  const supabase = await createClient()
  
  const { data: stage } = await supabase
    .from('stages')
    .select('id')
    .eq('name', stageName)
    .single()

  if (!stage) {
    return { error: 'Stage not found' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('stage_id', stage.id)
    .eq('is_active', true)
    .order('identifier')

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getRoomWithAnimals(roomId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stage:stages(*),
      animals:animals(*)
    `)
    .eq('id', roomId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateRoomCapacity(roomId: string, capacity: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('rooms')
    .update({ capacity })
    .eq('id', roomId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
