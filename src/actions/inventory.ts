
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type InventoryItemData = {
  product_name: string
  category: 'feed' | 'medicine' | 'vaccine' | 'supplies' | 'other'
  quantity: number
  unit: string
  price: number
  alert_threshold?: number
  notes?: string
}

export async function createInventoryItem(data: InventoryItemData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get the count of existing items to generate next serial number
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
    
    const nextSerialNumber = ((count || 0) + 1).toString()
    
    const { data: item, error } = await supabase
      .from('inventory')
      .insert({
        serial_number: nextSerialNumber,
        product_name: data.product_name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        alert_threshold: data.alert_threshold || 10,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/protected/inventory')
    revalidatePath('/inventory')
    
    return { success: true, item }
  } catch (error) {
    return { error: 'Failed to create inventory item: ' + String(error) }
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItemData>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { data: item, error } = await supabase
      .from('inventory')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/protected/inventory')
    revalidatePath('/inventory')
    
    return { success: true, item }
  } catch (error) {
    return { error: 'Failed to update inventory item: ' + String(error) }
  }
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/protected/inventory')
    revalidatePath('/inventory')
    
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete inventory item: ' + String(error) }
  }
}
