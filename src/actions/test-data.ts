'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTestData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // First, create some test animals if they don't exist
    const { data: existingAnimals } = await supabase
      .from('animals')
      .select('id')
      .limit(1)

    if (!existingAnimals || existingAnimals.length === 0) {
      // Create test animals
      const testAnimals = [
        {
          animal_id: 'TEST001',
          category: 'beef' as const,
          incoming_company: 'Test Farm Ltd',
          entry_date: new Date('2024-01-15').toISOString().split('T')[0],
          entry_weight: 650,
          age_months: 24,
          purchase_price: 1200,
        },
        {
          animal_id: 'TEST002', 
          category: 'goat' as const,
          incoming_company: 'Test Farm Ltd',
          entry_date: new Date('2024-02-10').toISOString().split('T')[0],
          entry_weight: 45,
          age_months: 12,
          purchase_price: 300,
        },
        {
          animal_id: 'TEST003',
          category: 'sheep' as const,
          incoming_company: 'Test Farm Ltd',
          entry_date: new Date('2024-03-05').toISOString().split('T')[0],
          entry_weight: 55,
          age_months: 18,
          purchase_price: 250,
        }
      ]

      const { error: animalsError } = await supabase
        .from('animals')
        .insert(testAnimals)

      if (animalsError) {
        console.error('Error creating test animals:', animalsError)
        return { error: 'Failed to create test animals: ' + animalsError.message }
      }
    }

    // Now create some test slaughter reports
    const { data: animals } = await supabase
      .from('animals')
      .select('id, animal_id, category')
      .limit(3)

    if (animals && animals.length > 0) {
      const testReports = animals.map((animal, index) => ({
        animal_id: animal.id,
        slaughter_date: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        slaughter_weight: animal.category === 'beef' ? 650 : animal.category === 'sheep' ? 55 : 45,
        carcass_weight: animal.category === 'beef' ? 390 : animal.category === 'sheep' ? 32 : 26,
        carcass_percentage: animal.category === 'beef' ? 60 : animal.category === 'sheep' ? 58 : 58,
        selling_price: animal.category === 'beef' ? 1200 : animal.category === 'sheep' ? 400 : 350,
        created_by: user.id
      }))

      const { error: reportsError } = await supabase
        .from('slaughter_reports')
        .insert(testReports)

      if (reportsError) {
        console.error('Error creating test reports:', reportsError)
        return { error: 'Failed to create test reports: ' + reportsError.message }
      }
    }

    revalidatePath('/protected/reports/slaughter')
    revalidatePath('/protected/debug')

    return { success: true, message: 'Test data created successfully' }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Unexpected error occurred' }
  }
}