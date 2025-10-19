'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAnimalCostBreakdown(animalId: string) {
  const supabase = await createClient()

  // Get animal details
  const { data: animal } = await supabase
    .from('animals')
    .select('*')
    .eq('id', animalId)
    .single()

  if (!animal) {
    return { error: 'Animal not found' }
  }

  // Get feeding costs
  let feedingLogs = null;
  if (animal.current_room_id) {
    const { data } = await supabase
      .from('feeding_logs')
      .select('*')
      .eq('room_id', animal.current_room_id);
    feedingLogs = data;
  }

  // Get medicine costs
  const { data: medicineLogs } = await supabase
    .from('medicine_logs')
    .select('*')
    .eq('animal_id', animalId)

  // Get vaccine costs
  const { data: vaccineLogs } = await supabase
    .from('vaccine_logs')
    .select('*')
    .eq('animal_id', animalId)

  // Calculate feeding costs (simplified - actual calculation would be more complex)

  const feedingCost = feedingLogs?.reduce((sum, log) => {
    const cost = (log.daily_use || 0) * (log.mcr_price || log.concentrate_price || log.bale_price || log.premix_price || 0);
    return sum + cost;
  }, 0) || 0;

  // Calculate medicine costs

  const medicineCost = medicineLogs?.reduce((sum, log) => {
    const doseCost = log.drug_volume && log.drug_volume > 0 
      ? (log.drug_price || 0) / log.drug_volume 
      : 0;
    const consuming = (log.drug_dose || 0) * (log.treatment_days || 1);
    const treatmentCost = consuming * doseCost;
    return sum + treatmentCost;
  }, 0) || 0;

  // Calculate vaccine costs

  const vaccineCost = vaccineLogs?.reduce((sum, log) => {
    const doseCost = log.vaccine_volume && log.vaccine_volume > 0 
      ? (log.vaccine_price || 0) / log.vaccine_volume 
      : 0;
    const numberOfDoses = log.second_dose_date ? 2 : 1;
    const totalCost = (log.vaccine_dose || 0) * doseCost * numberOfDoses;
    return sum + totalCost;
  }, 0) || 0;

  const purchaseCost = animal.purchase_price || 0
  const totalCost = purchaseCost + feedingCost + medicineCost + vaccineCost

  return {
    animal,
    costs: {
      purchase: purchaseCost,
      feeding: feedingCost,
      medicine: medicineCost,
      vaccine: vaccineCost,
      total: totalCost,
    },
  }
}

export async function getFarmCostSummary() {
  const supabase = await createClient()

  // Get all alive animals
  const { data: animals } = await supabase
    .from('animals')
    .select('id, purchase_price')
    .eq('is_alive', true)

  if (!animals) {
    return { error: 'Failed to fetch animals' }
  }

  // Get total feeding costs
  const { data: feedingLogs } = await supabase
    .from('feeding_logs')
    .select('*')

  // Get total medicine costs
  const { data: medicineLogs } = await supabase
    .from('medicine_logs')
    .select('*')

  // Get total vaccine costs
  const { data: vaccineLogs } = await supabase
    .from('vaccine_logs')
    .select('*')

  const totalPurchase = animals.reduce((sum, a) => sum + (a.purchase_price || 0), 0)
  

  const totalFeeding = feedingLogs?.reduce((sum, log) => {
    const cost = (log.daily_use || 0) * (log.mcr_price || log.concentrate_price || log.bale_price || log.premix_price || 0);
    return sum + cost;
  }, 0) || 0;


  const totalMedicine = medicineLogs?.reduce((sum, log) => {
    const doseCost = log.drug_volume && log.drug_volume > 0 
      ? (log.drug_price || 0) / log.drug_volume 
      : 0;
    const consuming = (log.drug_dose || 0) * (log.treatment_days || 1);
    return sum + (consuming * doseCost);
  }, 0) || 0;


  const totalVaccine = vaccineLogs?.reduce((sum, log) => {
    const doseCost = log.vaccine_volume && log.vaccine_volume > 0 
      ? (log.vaccine_price || 0) / log.vaccine_volume 
      : 0;
    const numberOfDoses = log.second_dose_date ? 2 : 1;
    return sum + ((log.vaccine_dose || 0) * doseCost * numberOfDoses);
  }, 0) || 0;

  return {
    totalAnimals: animals.length,
    costs: {
      purchase: totalPurchase,
      feeding: totalFeeding,
      medicine: totalMedicine,
      vaccine: totalVaccine,
      total: totalPurchase + totalFeeding + totalMedicine + totalVaccine,
    },
    averageCostPerAnimal: animals.length > 0 
      ? (totalPurchase + totalFeeding + totalMedicine + totalVaccine) / animals.length 
      : 0,
  }
}
