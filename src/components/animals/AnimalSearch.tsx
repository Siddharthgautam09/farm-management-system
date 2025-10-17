'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { searchAnimals } from '@/actions/animals'

export function AnimalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!query) return
    
    setLoading(true)
    const { data, error } = await searchAnimals(query)
    setLoading(false)
    
    if (data) {
      setResults(data)
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          placeholder="Search by Animal ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
          {results.map((animal) => (
            <div
              key={animal.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => router.push(`/dashboard/animals/${animal.animal_id}`)}
            >
              <div className="font-medium">{animal.animal_id}</div>
              <div className="text-sm text-gray-600">
                {animal.category} • {animal.current_stage?.display_name} • Room {animal.current_room?.identifier}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
