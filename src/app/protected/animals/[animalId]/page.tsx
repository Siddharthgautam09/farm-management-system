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
import { FeedingLogsList } from '@/components/feeding/FeedingLogsList'
import { FeedingLogDialog } from '@/components/feeding/FeedingLogDialog'
import { MedicineHistory } from '@/components/medicine/MedicineHistory'
import { MedicineLogDialog } from '@/components/medicine/MedicineLogDialog'
import { VaccineHistory } from '@/components/vaccine/VaccineHistory'
import { VaccineLogDialog } from '@/components/vaccine/VaccineLogDialog'
import { getFeedingLogsByRoom } from '@/actions/feeding'
import { getMedicineLogsByAnimal } from '@/actions/medicine'
import { getVaccineLogsByAnimal } from '@/actions/vaccine'
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

  // Get feeding logs for the current room
  const feedingLogs = animal.current_room_id 
    ? await getFeedingLogsByRoom(animal.current_room_id)
    : { data: [] }

  // Get medicine logs for this animal
  const medicineLogs = await getMedicineLogsByAnimal(animal.id)

  // Get vaccine logs for this animal
  const vaccineLogs = await getVaccineLogsByAnimal(animal.id)

  const feedingData = feedingLogs.data || []
  const medicineData = medicineLogs.data || []
  const vaccineData = vaccineLogs.data || []

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
          {animal.is_alive && !animal.is_sold && (
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
          )}
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
                {animal.is_alive ? (animal.is_sold ? 'Sold' : 'Alive') : 'Deceased'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Days on Farm</p>
              <p className="font-medium">
                {Math.floor((new Date().getTime() - new Date(animal.entry_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="weights" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="feeding">Feeding</TabsTrigger>
          <TabsTrigger value="medicine">Medicine</TabsTrigger>
          <TabsTrigger value="vaccine">Vaccine</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
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
              {animal.is_alive && !animal.is_sold && (
                <WeightEntryDialog
                  animalId={animal.id}
                  currentStageId={animal.current_stage_id!}
                  currentRoomId={animal.current_room_id!}
                >
                  <Button>Add Weight</Button>
                </WeightEntryDialog>
              )}
            </CardHeader>
            <CardContent>
              <WeightHistory weights={sortedWeights} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feeding Tab */}
        <TabsContent value="feeding">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Feeding Records</CardTitle>
                <CardDescription>
                  Feeding logs for Room {animal.current_room?.identifier}
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <FeedingLogDialog animalId={animal.id}>
                  <Button>Add Feeding Log</Button>
                </FeedingLogDialog>
              )}
            </CardHeader>
            <CardContent>
              {feedingData && feedingData.length > 0 ? (
                <FeedingLogsList logs={feedingData} />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No feeding records for this room yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medicine Tab */}
        <TabsContent value="medicine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medicine Records</CardTitle>
                <CardDescription>
                  Treatment history and costs
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <MedicineLogDialog animalId={animal.id}>
                  <Button>Add Medicine Record</Button>
                </MedicineLogDialog>
              )}
            </CardHeader>
            <CardContent>
              <MedicineHistory 
                logs={medicineData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccine Tab */}
        <TabsContent value="vaccine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vaccine Records</CardTitle>
                <CardDescription>
                  Vaccination history with dose schedules
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <VaccineLogDialog animalId={animal.id}>
                  <Button>Add Vaccine Record</Button>
                </VaccineLogDialog>
              )}
            </CardHeader>
            <CardContent>
              <VaccineHistory 
                logs={vaccineData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                Track all room and stage changes
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
                    .map((movement: {
                      id: string;
                      movement_date: string;
                      from_stage?: { display_name?: string } | null;
                      to_stage?: { display_name?: string } | null;
                      from_room?: { identifier?: string } | null;
                      to_room?: { identifier?: string } | null;
                    }) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <p className="font-medium">
                              {format(
                                new Date(movement.movement_date),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {movement.from_stage
                                ? `${movement.from_stage.display_name} (Room ${movement.from_room?.identifier})`
                                : 'Entry'}
                              {' → '}
                              {movement.to_stage?.display_name ?? 'Unknown'} (Room{' '}
                              {movement.to_room?.identifier ?? 'Unknown'})
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
      </Tabs>
    </div>
  )
}
