'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { FeedingLogForm } from './FeedingLogForm'
import { MedicineLogForm } from './MedicineLogForm'
import { VaccineLogForm } from './VaccineLogForm'

type WeightLog = {
  id: string
  recorded_date: string
  weight: number
  notes?: string | null
}

type FeedingLog = {
  id: string
  feed_type: string
  daily_use: number | null
  date_of_use: string
  mcr_price?: number | null
  concentrate_price?: number | null
  bale_price?: number | null
  notes?: string | null
}

type MedicineLog = {
  id: string
  drug_name: string
  drug_type: string
  drug_dose: number | null
  drug_price?: number | null
  treatment_days: number | null
  treatment_start_date?: string | null
  illness?: string | null
}

type VaccineLog = {
  id: string
  vaccine_name: string
  vaccine_dose: number | null
  vaccine_price?: number | null
  vaccine_company?: string | null
  first_dose_date?: string | null
  second_dose_date?: string | null
}

type AnimalDetailTabsProps = {
  animalId: string
  feedingLogs?: FeedingLog[]
  medicineLogs?: MedicineLog[]
  vaccineLogs?: VaccineLog[]
  weightLogs?: WeightLog[]
}

export function AnimalDetailTabs({
  animalId,
  feedingLogs = [],
  medicineLogs = [],
  vaccineLogs = [],
  weightLogs = [],
}: AnimalDetailTabsProps) {
  return (
    <Tabs defaultValue="weights" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="weights">Weights</TabsTrigger>
        <TabsTrigger value="feeding">Feeding</TabsTrigger>
        <TabsTrigger value="medicine">Medicine</TabsTrigger>
        <TabsTrigger value="vaccine">Vaccine</TabsTrigger>
      </TabsList>

      {/* Weights Tab */}
      <TabsContent value="weights" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Weight Records</CardTitle>
            <CardDescription>Track weight progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            {weightLogs && weightLogs.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Weight (kg)</th>
                      <th className="px-6 py-3">Gain (kg)</th>
                      <th className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightLogs.map((log, idx) => (
                      <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{format(new Date(log.recorded_date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 font-semibold">{log.weight} kg</td>
                        <td className="px-6 py-4 text-green-600">
                          {idx < weightLogs.length - 1 
                            ? `+${(log.weight - weightLogs[idx + 1].weight).toFixed(2)}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-gray-600">{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No weight records yet</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Feeding Tab */}
      <TabsContent value="feeding" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Feeding Logs</CardTitle>
              <CardDescription>Feed consumption records</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feeding Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Feeding Log</DialogTitle>
                  <DialogDescription>
                    Record feed consumption for this animal
                  </DialogDescription>
                </DialogHeader>
                <FeedingLogForm animalId={animalId} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {feedingLogs && feedingLogs.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Feed Type</th>
                      <th className="px-6 py-3">Daily Use</th>
                      <th className="px-6 py-3">Daily Cost</th>
                      <th className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedingLogs.map((log) => (
                      <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{format(new Date(log.date_of_use), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="capitalize">
                            {log.feed_type?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{log.daily_use} kg</td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          ${((log.daily_use || 0) * (log.mcr_price || log.concentrate_price || log.bale_price || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-center text-gray-500 mb-4">No feeding logs yet</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Feeding Log
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Feeding Log</DialogTitle>
                      <DialogDescription>
                        Record feed consumption for this animal
                      </DialogDescription>
                    </DialogHeader>
                    <FeedingLogForm animalId={animalId} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Medicine Tab */}
      <TabsContent value="medicine" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medicine Records</CardTitle>
              <CardDescription>Treatment history</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Medicine Record</DialogTitle>
                  <DialogDescription>
                    Record a medicine treatment for this animal
                  </DialogDescription>
                </DialogHeader>
                <MedicineLogForm animalId={animalId} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {medicineLogs && medicineLogs.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Start Date</th>
                      <th className="px-6 py-3">Drug Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Cost</th>
                      <th className="px-6 py-3">Illness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicineLogs.map((log) => (
                      <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {log.treatment_start_date ? format(new Date(log.treatment_start_date), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 font-semibold">{log.drug_name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{log.drug_type}</Badge>
                        </td>
                        <td className="px-6 py-4">{log.treatment_days || 1} days</td>
                        <td className="px-6 py-4 font-semibold text-red-600">
                          ${((log.drug_dose || 0) * (log.drug_price || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">{log.illness || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-center text-gray-500 mb-4">No medicine records yet</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medicine Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Medicine Record</DialogTitle>
                      <DialogDescription>
                        Record a medicine treatment for this animal
                      </DialogDescription>
                    </DialogHeader>
                    <MedicineLogForm animalId={animalId} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Vaccine Tab */}
      <TabsContent value="vaccine" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vaccination Records</CardTitle>
              <CardDescription>Immunization history</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vaccine Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Vaccine Record</DialogTitle>
                  <DialogDescription>
                    Record a vaccination for this animal
                  </DialogDescription>
                </DialogHeader>
                <VaccineLogForm animalId={animalId} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {vaccineLogs && vaccineLogs.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">First Dose</th>
                      <th className="px-6 py-3">Vaccine Name</th>
                      <th className="px-6 py-3">Second Dose</th>
                      <th className="px-6 py-3">Cost</th>
                      <th className="px-6 py-3">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccineLogs.map((log) => (
                      <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {log.first_dose_date ? format(new Date(log.first_dose_date), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 font-semibold">{log.vaccine_name}</td>
                        <td className="px-6 py-4">
                          {log.second_dose_date ? (
                            <Badge variant="default">{format(new Date(log.second_dose_date), 'MMM dd')}</Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-orange-600">
                          ${((log.vaccine_dose || 0) * (log.vaccine_price || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">{log.vaccine_company || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-center text-gray-500 mb-4">No vaccination records yet</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Vaccine Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Vaccine Record</DialogTitle>
                      <DialogDescription>
                        Record a vaccination for this animal
                      </DialogDescription>
                    </DialogHeader>
                    <VaccineLogForm animalId={animalId} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
