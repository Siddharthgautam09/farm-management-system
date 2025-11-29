import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Plus, Users, MoveRight, TrendingUp, Activity, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AnimalSearch } from '@/components/animals/AnimalSearch'
import { MoveAnimalDialog } from '@/components/animals/MoveAnimalDialog'
import { AddAnimalModal } from '@/components/animals/AddAnimalModal'
import { DeleteAnimalButton } from '@/components/animals/DeleteAnimalButton'
import { AnimalsPageClient } from '@/components/animals/AnimalsPageClient'
import { getDashboardStats } from '@/actions/dashboard'

export default async function AnimalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get alert count
  const stats = await getDashboardStats()
  const alertCount = (stats.lowStockItems?.length || 0) + (stats.upcomingVaccines?.length || 0)

  // Fetch all animals with their current stage and room
  const { data: animals, error } = await supabase
    .from('animals')
    .select(`
      *,
      current_stage:stages!current_stage_id(id, name, display_name),
      current_room:rooms!current_room_id(id, identifier)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching animals:', error)
  }

  // Fetch stages and rooms for move functionality
  const { data: stages } = await supabase.from('stages').select('*')
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, identifier, stage_id, current_count, capacity')
    .eq('is_active', true)

  const displayAnimals = animals || []

  // Calculate statistics
  const totalAnimals = displayAnimals.length
  const aliveAnimals = displayAnimals.filter(a => a.is_alive && !a.is_sold).length
  const soldAnimals = displayAnimals.filter(a => a.is_sold).length
  const deceasedAnimals = displayAnimals.filter(a => !a.is_alive).length

  // Group by category
  const beefAnimals = displayAnimals.filter(a => a.category === 'beef' && a.is_alive && !a.is_sold).length
  const camelAnimals = displayAnimals.filter(a => a.category === 'camel' && a.is_alive && !a.is_sold).length
  const sheepAnimals = displayAnimals.filter(a => a.category === 'sheep' && a.is_alive && !a.is_sold).length
  const goatAnimals = displayAnimals.filter(a => a.category === 'goat' && a.is_alive && !a.is_sold).length

  return (
    <div className="space-y-6">
      <Header 
        user={user} 
        alertCount={alertCount}
        lowStockItems={stats.lowStockItems}
        upcomingVaccines={stats.upcomingVaccines}
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold inline-flex items-center gap-2">
            <Users className="h-8 w-8" />
            All Animals
          </h1>
        </div>
      </div>

      {/* Statistics Cards - Dashboard Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Animals</p>
              <p className="text-2xl font-bold text-gray-900">{totalAnimals}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active (Alive)</p>
              <p className="text-2xl font-bold text-green-600">{aliveAnimals}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">By Category</p>
              <div className="text-xs mt-1 space-y-0.5">
                <div>Beef: <span className="font-bold">{beefAnimals}</span></div>
                <div>Camel: <span className="font-bold">{camelAnimals}</span></div>
                <div>Sheep: <span className="font-bold">{sheepAnimals}</span></div>
                <div>Goat: <span className="font-bold">{goatAnimals}</span></div>
              </div>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sold / Deceased</p>
              <p className="text-2xl font-bold text-orange-600">{soldAnimals} / {deceasedAnimals}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Animals List with Filters */}
      <AnimalsPageClient 
        animals={displayAnimals}
        rooms={rooms || []}
        stages={stages || []}
      />
    </div>
  )
}
