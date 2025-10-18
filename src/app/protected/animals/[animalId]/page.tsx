import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MoveRight } from 'lucide-react'
import Link from 'next/link'
import { WeightHistory } from '@/components/weights/WeightHistory'
import { WeightEntryDialog } from '@/components/weights/WeightEntryDialog'
import { MoveAnimalDialog } from '@/components/animals/MoveAnimalDialog'
import { format } from 'date-fns'

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ animalId: string }>
}) {
  const { animalId } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch animal details
  const { data: animal, error } = await supabase
    .from('animals')
    .select(`
      *,
      current_stage:stages!current_stage_id(id, name, display_name),
      current_room:rooms!current_room_id(id, identifier),
      movements:animal_movements(
        id,
        from_stage_id,
        from_room_id,
        to_stage_id,
        to_room_id,
        movement_date,
        from_stage:stages!from_stage_id(display_name),
        from_room:rooms!from_room_id(identifier),
        to_stage:stages!to_stage_id(display_name),
        to_room:rooms!to_room_id(identifier)
      ),
      weights:weight_records(
        *,
        stage:stages(display_name),
        room:rooms(identifier)
      )
    `)
    .eq('animal_id', animalId)
    .single()

  if (error || !animal) {
    notFound()
  }

  // Fetch stages and rooms for movement dialog
  const { data: stages } = await supabase.from('stages').select('*')
  const { data: rooms } = await supabase.from('rooms').select('*').eq('is_active', true)

  // Sort weights by date
  const sortedWeights = animal.weights?.sort(
    (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
  ) || []

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/animals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{animal.animal_id}</h1>
            <p className="text-gray-600">
              {animal.category.charAt(0).toUpperCase() + animal.category.slice(1)} •{' '}
              {animal.current_stage?.display_name} • Room {animal.current_room?.identifier}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <MoveAnimalDialog
            animalId={animal.id}
            currentStageId={animal.current_stage_id!}
            stages={stages || []}
            rooms={rooms || []}
          >
            <Button variant="outline">
              <MoveRight className="h-4 w-4 mr-2" />
              Move Animal
            </Button>
          </MoveAnimalDialog>
        </div>
      </div>

      {/* Animal Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
          <CardDescription>Basic details about this animal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <Badge variant="default" className="capitalize">
                {animal.category}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Entry Date</p>
              <p className="font-medium">
                {format(new Date(animal.entry_date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Incoming Company</p>
              <p className="font-medium">{animal.incoming_company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Old Calf Number</p>
              <p className="font-medium">{animal.old_calf_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Entry Weight</p>
              <p className="font-medium">
                {animal.entry_weight ? `${animal.entry_weight} kg` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Age (at entry)</p>
              <p className="font-medium">
                {animal.age_months ? `${animal.age_months} months` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
              <p className="font-medium">
                {animal.purchase_price ? `$${animal.purchase_price.toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge variant={animal.is_alive ? 'default' : 'destructive'}>
                {animal.is_alive ? 'Alive' : 'Deceased'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sold</p>
              <Badge variant={animal.is_sold ? 'secondary' : 'outline'}>
                {animal.is_sold ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="weights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weights">Weight History</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="feeding">Feeding</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
        </TabsList>

        {/* Weight History Tab */}
        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weight Records</CardTitle>
                <CardDescription>
                  Track weight changes throughout the lifecycle
                </CardDescription>
              </div>
              <WeightEntryDialog
                animalId={animal.id}
                currentStageId={animal.current_stage_id!}
                currentRoomId={animal.current_room_id!}
              >
                <Button>Add Weight</Button>
              </WeightEntryDialog>
            </CardHeader>
            <CardContent>
              <WeightHistory weights={sortedWeights} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                Track of all room and stage changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {animal.movements && animal.movements.length > 0 ? (
                <div className="space-y-4">
                  {animal.movements
                    .sort(
                      (a, b) =>
                        new Date(b.movement_date).getTime() -
                        new Date(a.movement_date).getTime()
                    )
                    .map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <p className="font-medium">
                              {format(
                                new Date(movement.movement_date),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </p>
                            <p className="text-gray-600">
                              {movement.from_stage
                                ? `${movement.from_stage.display_name} (Room ${movement.from_room?.identifier})`
                                : 'Entry'}
                              {' → '}
                              {movement.to_stage?.display_name} (Room{' '}
                              {movement.to_room?.identifier})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No movement history yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feeding Tab - Placeholder */}
        <TabsContent value="feeding">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Records</CardTitle>
              <CardDescription>Coming in Week 5-6</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Feeding tracking will be implemented in the next phase
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab - Placeholder */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>
                Medicine and vaccine history - Coming in Week 5-6
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Medicine and vaccine tracking will be implemented in the next phase
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
