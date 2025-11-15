'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'

type Animal = {
  id: string
  animal_id: string
  category: string
  current_stage: {
    display_name: string
  } | null
  current_room: {
    identifier: string
  } | null
}

export function AnimalSearch() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Animal[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const searchAnimals = async () => {
      if (searchQuery.length < 2) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/animals/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setResults(data.animals || [])
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(() => {
      searchAnimals()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSelect = (animalId: string) => {
    setOpen(false)
    setSearchQuery('')
    router.push(`/animals/${animalId}`)
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
      <Input
        placeholder="Search animals..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setOpen(e.target.value.length >= 2)
        }}
        onFocus={() => searchQuery.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="pl-10"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 pointer-events-none" />
      )}
      
      {open && results.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-[300px] overflow-auto">
          <Command>
            <CommandList>
              <CommandGroup heading="Animals">
                {results.map((animal) => (
                  <CommandItem
                    key={animal.id}
                    onSelect={() => handleSelect(animal.animal_id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="font-medium">{animal.animal_id}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {animal.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {animal.current_stage && (
                          <Badge variant="outline" className="text-xs">
                            {animal.current_stage.display_name}
                          </Badge>
                        )}
                        {animal.current_room && (
                          <Badge variant="secondary" className="text-xs">
                            Room {animal.current_room.identifier}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      
      {open && searchQuery.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 p-4 text-center text-gray-500">
          No animals found
        </div>
      )}
    </div>
  )
}
