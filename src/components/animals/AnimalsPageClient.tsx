'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoveRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MoveAnimalDialog } from '@/components/animals/MoveAnimalDialog'
import { DeleteAnimalButton } from '@/components/animals/DeleteAnimalButton'
import { AnimalSearch } from '@/components/animals/AnimalSearch'
import { AddAnimalModal } from '@/components/animals/AddAnimalModal'

type Animal = {
  id: string
  animal_id: string
  category: string
  entry_date: string
  is_alive: boolean
  is_sold: boolean
  current_stage_id: string | null
  current_room_id: string | null
  current_stage?: {
    id: string
    name: string
    display_name: string
  } | null
  current_room?: {
    id: string
    identifier: string
  } | null
}

type Room = {
  id: string
  identifier: string
  stage_id: string
  current_count: number
  capacity: number
}

type Stage = {
  id: string
  name: string
  display_name: string
}

type AnimalsPageClientProps = {
  animals: Animal[]
  rooms: Room[]
  stages: Stage[]
}

export function AnimalsPageClient({ animals, rooms, stages }: AnimalsPageClientProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesCategory = categoryFilter === 'all' || animal.category === categoryFilter
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'alive' && animal.is_alive && !animal.is_sold) ||
        (statusFilter === 'sold' && animal.is_sold) ||
        (statusFilter === 'deceased' && !animal.is_alive)
      
      return matchesCategory && matchesStatus
    })
  }, [animals, categoryFilter, statusFilter])

  const categories = useMemo(() => {
    return Array.from(new Set(animals.map(a => a.category))).sort()
  }, [animals])

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="flex-1 max-w-md">
            <AnimalSearch />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    <span className="capitalize">{category}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AddAnimalModal rooms={rooms} stages={stages} />
      </div>

      {/* Animals Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">All Animals</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredAnimals.length} of {animals.length} animals
          </p>
        </div>
        
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">No animals found matching your filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setCategoryFilter('all')
                setStatusFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">S.No</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Animal ID</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Category</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Current Stage</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Room</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Entry Date</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal, index) => (
                  <tr key={animal.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3">
                      <Link 
                        href={`/protected/animals/${animal.animal_id}`}
                        className="font-mono text-blue-600 hover:underline text-sm"
                      >
                        {animal.animal_id}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {animal.category}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {animal.current_stage?.display_name || '-'}
                    </td>
                    <td className="p-3">
                      {animal.current_room ? (
                        <Link 
                          href={`/protected/rooms/${animal.current_room_id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Room {animal.current_room.identifier}
                        </Link>
                      ) : <span className="text-sm text-gray-500">-</span>}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {format(new Date(animal.entry_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={animal.is_alive ? (animal.is_sold ? 'secondary' : 'default') : 'destructive'}
                        className="text-xs"
                      >
                        {animal.is_alive ? (animal.is_sold ? 'Sold' : 'Alive') : 'Deceased'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/protected/animals/${animal.animal_id}`}>
                            View
                          </Link>
                        </Button>
                        {animal.is_alive && !animal.is_sold && (
                          <MoveAnimalDialog
                            animalId={animal.id}
                            currentStageId={animal.current_stage_id!}
                            stages={stages}
                            rooms={rooms}
                          >
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <MoveRight className="h-4 w-4" />
                            </Button>
                          </MoveAnimalDialog>
                        )}
                        <DeleteAnimalButton 
                          animalId={animal.id} 
                          animalName={animal.animal_id} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
