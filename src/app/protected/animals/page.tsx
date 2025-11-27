import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Plus, Users, MoveRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AnimalSearch } from '@/components/animals/AnimalSearch'
import { MoveAnimalDialog } from '@/components/animals/MoveAnimalDialog'
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

      {/* Search Bar */}
      <div className="flex justify-between items-end gap-4">
        <div className="max-w-md flex-1">
          <AnimalSearch />
        </div>
        <Button asChild className="shrink-0">
          <Link href="/animals/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnimals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active (Alive)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aliveAnimals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>Beef: <span className="font-bold">{beefAnimals}</span></div>
              <div>Camel: <span className="font-bold">{camelAnimals}</span></div>
              <div>Sheep: <span className="font-bold">{sheepAnimals}</span></div>
              <div>Goat: <span className="font-bold">{goatAnimals}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sold / Deceased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldAnimals} / {deceasedAnimals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Animals List */}
      <Card>
        <CardHeader>
          <CardTitle>All Animals</CardTitle>
          <CardDescription>
            Click on any animal to view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayAnimals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No animals found</p>
              <Button asChild>
                <Link href="/animals/new">Add Your First Animal</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-600">Animal ID</th>
                    <th className="text-left p-3 font-medium text-gray-600">Category</th>
                    <th className="text-left p-3 font-medium text-gray-600">Current Stage</th>
                    <th className="text-left p-3 font-medium text-gray-600">Room</th>
                    <th className="text-left p-3 font-medium text-gray-600">Entry Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAnimals.map((animal) => (
                    <tr key={animal.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Link 
                          href={`/protected/animals/${animal.animal_id}`}
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {animal.animal_id}
                        </Link>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {animal.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {animal.current_stage?.display_name || '-'}
                      </td>
                      <td className="p-3">
                        {animal.current_room ? (
                          <Link 
                            href={`/protected/rooms/${animal.current_room_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Room {animal.current_room.identifier}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        {format(new Date(animal.entry_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={animal.is_alive ? (animal.is_sold ? 'secondary' : 'default') : 'destructive'}
                        >
                          {animal.is_alive ? (animal.is_sold ? 'Sold' : 'Alive') : 'Deceased'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/protected/animals/${animal.animal_id}`}>
                              View Details
                            </Link>
                          </Button>
                          {animal.is_alive && !animal.is_sold && (
                            <MoveAnimalDialog
                              animalId={animal.id}
                              currentStageId={animal.current_stage_id!}
                              stages={stages || []}
                              rooms={rooms || []}
                            >
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                <MoveRight className="h-4 w-4" />
                              </Button>
                            </MoveAnimalDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
