'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type FeedingLogData = {
  room_id: string
  stage_id: string
  feed_type: 'mcr' | 'concentrated_feed' | 'alfa_alfa' | 'hay' | 'premix'
  company_name?: string
  item_name?: string
  
  // MCR specific
  mcr_quantity?: number
  mcr_price?: number
  
  // Concentrated Feed specific
  protein_percentage?: number
  concentrate_quantity?: number
  concentrate_price?: number
  
  // Alfa Alfa / Hay specific
  bale_weight?: number
  bale_quantity?: number
  bale_price?: number
  
  // Premix specific
  premix_volume?: string
  premix_quantity?: number
  premix_price?: number
  
  daily_use: number
  date_of_use: string
  purchase_date?: string
}

export async function addFeedingLog(data: FeedingLogData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: feedingLog, error } = await supabase
    .from('feeding_logs')
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/feeding')
  return { success: true, feeding: feedingLog }
}

export async function getFeedingLogsByRoom(roomId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('feeding_logs')
    .select(`
      *,
      room:rooms(identifier),
      stage:stages(display_name)
    `)
    .eq('room_id', roomId)
    .order('date_of_use', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function calculateFeedingCosts(roomId: string) {
  const supabase = await createClient()
  
  // Get room with animal count
  const { data: room } = await supabase
    .from('rooms')
    .select('current_count')
    .eq('id', roomId)
    .single()

  if (!room) {
    return { error: 'Room not found' }
  }

  // Get feeding logs for this room
  const { data: logs } = await supabase
    .from('feeding_logs')
    .select('*')
    .eq('room_id', roomId)

  if (!logs) {
    return { data: null }
  }

  const animalCount = room.current_count || 1

  // Calculate costs per feed type
  const calculations = logs.map(log => {
    let dailyCost = 0
    let averageConsume = 0
    let calfConsumeCost = 0

    switch (log.feed_type) {
      case 'mcr':
        dailyCost = (log.daily_use ?? 0) * (log.mcr_price || 0)
        averageConsume = (log.daily_use ?? 0) / animalCount
        calfConsumeCost = averageConsume * (log.mcr_price || 0)
        break

      case 'concentrated_feed':
        dailyCost = (log.daily_use ?? 0) * (log.concentrate_price || 0)
        averageConsume = (log.daily_use ?? 0) / animalCount
        calfConsumeCost = averageConsume * (log.concentrate_price || 0)
        break

      case 'alfa_alfa':
      case 'hay':
        dailyCost = (log.daily_use ?? 0) * (log.bale_price || 0)
        averageConsume = (log.daily_use ?? 0) / animalCount
        calfConsumeCost = averageConsume * (log.bale_price || 0)
        break

      case 'premix':
        dailyCost = (log.daily_use ?? 0) * (log.premix_price || 0)
        averageConsume = (log.daily_use ?? 0) / animalCount
        calfConsumeCost = averageConsume * (log.premix_price || 0)
        break
    }

    return {
      ...log,
      dailyCost,
      averageConsume,
      calfConsumeCost,
    }
  })

  return { data: calculations }
}

export async function deleteFeedingLog(logId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('feeding_logs')
    .delete()
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/feeding')
  return { success: true }
}
