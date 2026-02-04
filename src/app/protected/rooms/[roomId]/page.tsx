import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Activity, TrendingUp, Calendar, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stage:stages(*)
    `)
    .eq('id', roomId)
    .single()

  if (error || !room) {
    notFound()
  }

  // Get animals in this room with comprehensive details
  const { data: animals } = await supabase
    .from('animals')
    .select(`
      *,
      current_stage:stages!current_stage_id(name, display_name),
      weights:weight_records(weight, recorded_date, notes)
    `)
    .eq('current_room_id', roomId)
    .eq('is_alive', true)
    .order('entry_date', { ascending: false })

  // Get recent feeding logs for this room - simplified for now
  // const { data: recentFeeding } = await supabase
  //   .from('feeding_logs')
  //   .select(`
  //     id,
  //     feed_type,
  //     feeding_date,
  //     animal_id
  //   `)
  //   .eq('room_id', roomId)
  //   .order('feeding_date', { ascending: false })
  //   .limit(5)

  // Calculate room statistics
  const totalAnimals = animals?.length || 0
  const averageWeight = animals?.length 
    ? animals.reduce((sum, animal) => {
        const latestWeight = animal.weights?.[0]?.weight || 0
        return sum + latestWeight
      }, 0) / animals.length 
    : 0

  const utilizationRate = room.capacity ? (totalAnimals / room.capacity) * 100 : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${room.stage.name}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Room {room.identifier}
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-0">
            {room.stage.display_name} • {room.current_count}/{room.capacity} animals
          </p>
        </div>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Animals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAnimals}</p>
            <p className="text-xs text-gray-500">out of {room.capacity}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">capacity used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{averageWeight.toFixed(1)} kg</p>
            <p className="text-xs text-gray-500">current average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={room.is_active ? "default" : "secondary"}>
              {room.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Animals List */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div>
            <CardTitle>Animals in this Room</CardTitle>
            <CardDescription>
              Current animals housed in Room {room.identifier} with latest updates
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {animals && animals.length > 0 && (
              <Button variant="outline" asChild>
                <Link href={`/protected/reports?room=${roomId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/protected/animals/new">
                <Users className="h-4 w-4 mr-2" />
                Add Animal
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {animals && animals.length > 0 ? (
            <div className="space-y-4">
                {animals.map((animal) => {
                const latestWeight = animal.weights?.[0]
                
                return (
                  <div key={animal.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link 
                            href={`/protected/animals/${animal.animal_id}`}
                            className="text-lg font-semibold text-blue-600 hover:underline"
                          >
                            {animal.animal_id}
                          </Link>
                          <Badge variant="secondary" className="capitalize">
                            {animal.category}
                          </Badge>
                          <Badge variant="outline">
                            {animal.current_stage?.display_name}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Entry Date</p>
                            <p className="font-medium">{format(new Date(animal.entry_date), 'MMM dd, yyyy')}</p>
                          </div>
                          
                          {latestWeight && (
                            <div>
                              <p className="text-gray-500">Latest Weight</p>
                              <p className="font-medium">{latestWeight.weight} kg</p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(latestWeight.recorded_date), 'MMM dd')}
                              </p>
                            </div>
                          )}
                          
                          {animal.age_months && (
                            <div>
                              <p className="text-gray-500">Age</p>
                              <p className="font-medium">{animal.age_months} months</p>
                            </div>
                          )}
                          
                          {animal.purchase_price && (
                            <div>
                              <p className="text-gray-500">Purchase Price</p>
                              <p className="font-medium">${animal.purchase_price}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {animal.entry_weight && (
                            <Badge variant="outline" className="text-xs">
                              Entry Weight: {animal.entry_weight} kg
                            </Badge>
                          )}
                          {animal.old_calf_number && (
                            <Badge variant="outline" className="text-xs">
                              Old ID: {animal.old_calf_number}
                            </Badge>
                          )}
                          {animal.incoming_company && (
                            <Badge variant="outline" className="text-xs">
                              From: {animal.incoming_company}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0 ml-0 md:ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/protected/animals/${animal.animal_id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Bulk Actions
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Bulk Actions for All Animals</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/protected/reports/weights?room=${roomId}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Weight Report
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/protected/reports/feeding?room=${roomId}`}>
                      <Activity className="h-3 w-3 mr-1" />
                      Feeding Report
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/protected/reports/health?room=${roomId}`}>
                      <Activity className="h-3 w-3 mr-1" />
                      Health Report
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/protected/animals?room=${roomId}&export=true`}>
                      <FileText className="h-3 w-3 mr-1" />
                      Export All Details
                    </Link>
                  </Button>
                </div>
              </div> */}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No animals currently in this room</p>
              <Button asChild>
                <Link href="/protected/animals/new">
                  <Users className="h-4 w-4 mr-2" />
                  Add First Animal
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
