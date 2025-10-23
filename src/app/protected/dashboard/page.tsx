'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Get animal counts by stage
  const { data: animals } = await supabase
    .from('animals')
    .select(`
      id,
      is_alive,
      is_sold,
      category,
      current_stage:stages!current_stage_id(name, display_name)
    `)

  // Count animals
  const totalAnimals = animals?.length || 0
  const aliveAnimals = animals?.filter(a => a.is_alive && !a.is_sold).length || 0
  const soldAnimals = animals?.filter(a => a.is_sold).length || 0
  const deceasedAnimals = animals?.filter(a => !a.is_alive && !a.is_sold).length || 0

  // Animals by stage
  const byStage = animals?.reduce((acc: any, animal) => {
    if (animal.is_alive && !animal.is_sold && animal.current_stage) {
      const stageName = animal.current_stage.display_name
      acc[stageName] = (acc[stageName] || 0) + 1
    }
    return acc
  }, {})

  // Animals by category
  const byCategory = animals?.reduce((acc: any, animal) => {
    if (animal.is_alive && !animal.is_sold) {
      const category = animal.category
      acc[category] = (acc[category] || 0) + 1
    }
    return acc
  }, {})

  // Get recent weight records
  const { data: recentWeights } = await supabase
    .from('weight_records')
    .select(`
      id,
      weight,
      recorded_date,
      animal:animals(animal_id)
    `)
    .order('recorded_date', { ascending: false })
    .limit(5)

  // Get low stock inventory
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .order('quantity', { ascending: true })
    .limit(5)

  const lowStockItems = inventory?.filter(item => {
    const threshold = item.alert_threshold || 10
    return item.quantity <= threshold
  })

  // Get recent animal movements
  const { data: recentMovements } = await supabase
    .from('animal_movements')
    .select(`
      id,
      movement_date,
      animal:animals(animal_id),
      from_stage:stages!from_stage_id(display_name),
      to_stage:stages!to_stage_id(display_name),
      from_room:rooms!from_room_id(identifier),
      to_room:rooms!to_room_id(identifier)
    `)
    .order('movement_date', { ascending: false })
    .limit(5)

  // Get upcoming vaccine reminders
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: upcomingVaccines } = await supabase
    .from('vaccine_logs')
    .select(`
      id,
      vaccine_name,
      second_dose_date,
      animal:animals(animal_id)
    `)
    .gte('second_dose_date', today)
    .lte('second_dose_date', nextWeek)
    .order('second_dose_date', { ascending: true })

  return {
    totalAnimals,
    aliveAnimals,
    soldAnimals,
    deceasedAnimals,
    byStage,
    byCategory,
    recentWeights,
    lowStockItems,
    recentMovements,
    upcomingVaccines,
  }
}

export async function getFinancialSummary() {
  const supabase = await createClient()

  // Get total purchase costs
  const { data: animals } = await supabase
    .from('animals')
    .select('purchase_price, is_alive')

  const totalPurchaseCost = animals?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0
  const activePurchaseCost = animals?.filter(a => a.is_alive).reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0

  // Get slaughter revenue
  const { data: slaughterReports } = await supabase
    .from('slaughter_reports')
    .select('selling_price')

  const totalRevenue = slaughterReports?.reduce((sum, r) => sum + (r.selling_price || 0), 0) || 0

  // Get death losses
  const { data: deathReports } = await supabase
    .from('death_reports')
    .select('animal:animals(purchase_price)')

  const totalDeathLoss = deathReports?.reduce(
    (sum: number, r: { animal: { purchase_price: number | null | undefined } | null }) =>
      sum + (r.animal?.purchase_price ?? 0),
    0
  ) || 0

  // Calculate profit/loss
  const profitLoss = totalRevenue - (totalPurchaseCost - activePurchaseCost)

  return {
    totalInvestment: totalPurchaseCost,
    activeInvestment: activePurchaseCost,
    totalRevenue,
    totalDeathLoss,
    profitLoss,
  }
}
