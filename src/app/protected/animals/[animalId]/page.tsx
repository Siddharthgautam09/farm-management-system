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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" asChild>
            <Link href="/animals">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{animal.animal_id}</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
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
              <Button variant="outline" className="h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto">
                <MoveRight className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Move Animal</span>
                <span className="sm:hidden">Move</span>
              </Button>
            </MoveAnimalDialog>
          )}
        </div>
      </div>

      {/* Animal Info Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Animal Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Basic details about this animal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Category</p>
              <Badge variant="default" className="capitalize text-xs sm:text-sm">
                {animal.category}
              </Badge>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Entry Date</p>
              <p className="text-sm sm:text-base font-medium">
                {format(new Date(animal.entry_date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Incoming Company</p>
              <p className="text-sm sm:text-base font-medium truncate">{animal.incoming_company || '-'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Old Calf Number</p>
              <p className="text-sm sm:text-base font-medium truncate">{animal.old_calf_number || '-'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Entry Weight</p>
              <p className="text-sm sm:text-base font-medium">
                {animal.entry_weight ? `${animal.entry_weight} kg` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Age (at entry)</p>
              <p className="text-sm sm:text-base font-medium">
                {animal.age_months ? `${animal.age_months} months` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Purchase Price</p>
              <p className="text-sm sm:text-base font-medium break-words">
                {animal.purchase_price ? `$${animal.purchase_price.toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
              <Badge variant={animal.is_alive ? 'default' : 'destructive'} className="text-xs sm:text-sm">
                {animal.is_alive ? (animal.is_sold ? 'Sold' : 'Alive') : 'Deceased'}
              </Badge>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Days on Farm</p>
              <p className="text-sm sm:text-base font-medium">
                {Math.floor((new Date().getTime() - new Date(animal.entry_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="weights" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="weights" className="text-xs sm:text-sm py-2 sm:py-2.5">Weights</TabsTrigger>
          <TabsTrigger value="feeding" className="text-xs sm:text-sm py-2 sm:py-2.5">Feeding</TabsTrigger>
          <TabsTrigger value="medicine" className="text-xs sm:text-sm py-2 sm:py-2.5">Medicine</TabsTrigger>
          <TabsTrigger value="vaccine" className="text-xs sm:text-sm py-2 sm:py-2.5">Vaccine</TabsTrigger>
          <TabsTrigger value="movements" className="text-xs sm:text-sm py-2 sm:py-2.5">Movements</TabsTrigger>
        </TabsList>

        {/* Weight History Tab */}
        <TabsContent value="weights" className="space-y-3 sm:space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Weight Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Track weight changes throughout the lifecycle
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <WeightEntryDialog
                  animalId={animal.id}
                  currentStageId={animal.current_stage_id!}
                  currentRoomId={animal.current_room_id!}
                >
                  <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">Add Weight</Button>
                </WeightEntryDialog>
              )}
            </CardHeader>
            <CardContent>
              <WeightHistory weights={sortedWeights} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feeding Tab */}
        <TabsContent value="feeding" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Feeding Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Feeding logs for Room {animal.current_room?.identifier}
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <FeedingLogDialog animalId={animal.id}>
                  <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">Add Feeding Log</Button>
                </FeedingLogDialog>
              )}
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {feedingData && feedingData.length > 0 ? (
                <FeedingLogsList logs={feedingData} />
              ) : (
                <p className="text-center text-sm sm:text-base text-gray-500 py-6 sm:py-8">
                  No feeding records for this room yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medicine Tab */}
        <TabsContent value="medicine" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Medicine Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Treatment history and costs
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <MedicineLogDialog animalId={animal.id}>
                  <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">Add Medicine Record</Button>
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
        <TabsContent value="vaccine" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Vaccine Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Vaccination history with dose schedules
                </CardDescription>
              </div>
              {animal.is_alive && !animal.is_sold && (
                <VaccineLogDialog animalId={animal.id}>
                  <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">Add Vaccine Record</Button>
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
        <TabsContent value="movements" className="mt-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Movement History</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track all room and stage changes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {animal.movements && animal.movements.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
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
                        className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                          <div className="text-xs sm:text-sm min-w-0">
                            <p className="font-medium text-sm sm:text-base">
                              {format(
                                new Date(movement.movement_date),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </p>
                            <p className="text-gray-600 mt-1 break-words">
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
                <p className="text-center text-sm sm:text-base text-gray-500 py-6 sm:py-8">
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
