'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type InventoryItemData = {
  product_name: string
  quantity: number
  unit?: string
  purchase_date?: string
  price?: number
  category?: string
  alert_threshold?: number
}

export async function createInventoryItem(data: InventoryItemData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Calculate total cost
  const total_cost = data.price && data.quantity ? data.price * data.quantity : null

  const { data: item, error } = await supabase
    .from('inventory')
    .insert({
      ...data,
      total_cost,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true, item }
}

export async function updateInventoryQuantity(itemId: string, quantity: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get current item to recalculate total_cost
  const { data: item } = await supabase
    .from('inventory')
    .select('price')
    .eq('id', itemId)
    .single()

  const total_cost = item?.price ? item.price * quantity : null

  const { error } = await supabase
    .from('inventory')
    .update({ 
      quantity,
      total_cost,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function getInventoryItems(categoryFilter?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('inventory')
    .select('*')
    .order('product_name')

  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getLowStockItems() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .or('quantity.lte.alert_threshold,alert_threshold.is.null')
    .order('quantity', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  // Filter items where quantity is low
  const lowStock = data?.filter(item => {
    const threshold = item.alert_threshold || 10
    return item.quantity <= threshold
  })

  return { data: lowStock }
}

export async function deleteInventoryItem(itemId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function getInventoryStatistics() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')

  if (error) {
    return { error: error.message }
  }

  const totalItems = data?.length || 0
  const totalValue = data?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0
  const lowStockCount = data?.filter(item => {
    const threshold = item.alert_threshold || 10
    return item.quantity <= threshold
  }).length || 0

  const byCategory = data?.reduce((acc: Record<string, { count: number; value: number }>, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { count: 0, value: 0 };
    }
    acc[cat].count++;
    acc[cat].value += item.total_cost || 0;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  return {
    totalItems,
    totalValue,
    lowStockCount,
    byCategory,
  }
}
