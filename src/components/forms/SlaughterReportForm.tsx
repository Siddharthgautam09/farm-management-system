'use client'

import { useState, useMemo } from 'react'
import { createSlaughterReport } from '@/actions/slaughter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, X } from 'lucide-react'

type Animal = {
  id: string
  animal_id: string
  category: string
  entry_weight: number | null
}

type SlaughterReportFormProps = {
  animals: Animal[]
}

export function SlaughterReportForm({ animals }: SlaughterReportFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAnimalList, setShowAnimalList] = useState(false)
  const [formData, setFormData] = useState({
    animal_id: '',
    slaughter_date: new Date().toISOString().split('T')[0],
    slaughter_weight: '',
    carcass_weight: '',
    selling_price: '',
  })

  // Filter and search animals
  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesSearch = searchQuery === '' || 
        animal.animal_id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === '' || categoryFilter === 'all' || animal.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [animals, searchQuery, categoryFilter])

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(animals.map(animal => animal.category)))
  }, [animals])

  // Find selected animal for calculations
  const selectedAnimal = animals.find(animal => animal.id === formData.animal_id)
  
  const carcassPercentage = formData.slaughter_weight && formData.carcass_weight && Number(formData.slaughter_weight) > 0 && Number(formData.carcass_weight) > 0
    ? ((Number(formData.carcass_weight) / Number(formData.slaughter_weight)) * 100).toFixed(1)
    : '0.0'

  const clearanceRatio = formData.slaughter_weight && selectedAnimal?.entry_weight && Number(formData.slaughter_weight) > 0
    ? (Number(formData.slaughter_weight) / selectedAnimal.entry_weight).toFixed(1)
    : '0.0'

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAnimalSelect = (animalId: string) => {
    handleChange('animal_id', animalId)
    setShowAnimalList(false)
    setSearchQuery('')
    setCategoryFilter('all')
  }

  const clearAnimalSelection = () => {
    handleChange('animal_id', '')
    setShowAnimalList(true)
    setSearchQuery('')
    setCategoryFilter('all')
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowAnimalList(value.length > 0 || categoryFilter !== 'all')
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setShowAnimalList(value !== 'all' || searchQuery.length > 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    console.log('🚀 Form submission started')
    console.log('Current form data:', formData)
    
    // Basic validation
    if (!formData.animal_id) {
      toast({
        variant: 'destructive',
        title: 'No Animal Selected',
        description: 'Please select an animal first',
      })
      return
    }

    if (!formData.slaughter_weight || !formData.carcass_weight || !formData.selling_price) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill all required fields (weights and selling price)',
      })
      return
    }

    // Validate numbers
    const slaughterWeight = Number(formData.slaughter_weight)
    const carcassWeight = Number(formData.carcass_weight)
    const sellingPrice = Number(formData.selling_price)

    console.log('Parsed numbers:', { slaughterWeight, carcassWeight, sellingPrice })

    if (isNaN(slaughterWeight) || isNaN(carcassWeight) || isNaN(sellingPrice)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Numbers',
        description: 'Please enter valid numbers for weights and price',
      })
      return
    }

    if (slaughterWeight <= 0 || carcassWeight <= 0 || sellingPrice <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Values',
        description: 'All numeric values must be greater than 0',
      })
      return
    }

    if (carcassWeight > slaughterWeight) {
      toast({
        variant: 'destructive',
        title: 'Invalid Weight',
        description: 'Carcass weight cannot be greater than slaughter weight',
      })
      return
    }

    setIsSubmitting(true)
    console.log('=== FORM SUBMISSION ===')
    console.log('Form data being submitted:', {
      animal_id: formData.animal_id,
      slaughter_date: formData.slaughter_date,
      slaughter_weight: slaughterWeight,
      carcass_weight: carcassWeight,
      selling_price: sellingPrice,
    })

    try {
      const result = await createSlaughterReport({
        animal_id: formData.animal_id,
        slaughter_date: formData.slaughter_date,
        slaughter_weight: slaughterWeight,
        carcass_weight: carcassWeight,
        selling_price: sellingPrice,
      })

      console.log('Action result:', result)

      if (result.error) {
        console.error('❌ Form submission error:', result.error)
        toast({
          variant: 'destructive',
          title: 'Error Creating Report',
          description: result.error,
        })
      } else {
        console.log('✅ Form submission successful')
        toast({
          title: 'Success!',
          description: `Slaughter report created successfully! Carcass: ${carcassPercentage}%`,
        })
        
        // Force a complete page refresh to ensure data is visible
        setTimeout(() => {
          window.location.href = '/protected/reports/slaughter'
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Form submission exception:', error)
      toast({
        variant: 'destructive',
        title: 'Unexpected Error',
        description: 'Failed to create slaughter report. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Animal Selection Section */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Select Animal *</Label>
        
        <div className="space-y-4">
          {selectedAnimal ? (
            /* Selected Animal Display */
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 px-3 py-1 rounded-md">
                    <span className="font-mono font-semibold text-green-800">{selectedAnimal.animal_id}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="font-medium capitalize">{selectedAnimal.category}</div>
                    {selectedAnimal.entry_weight && (
                      <div className="text-xs text-gray-600">Entry Weight: {selectedAnimal.entry_weight}kg</div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAnimalSelection}
                  className="text-xs shrink-0"
                >
                  <X className="h-3 w-3 mr-1" />
                  Change
                </Button>
              </div>
            </div>
          ) : (
            /* Animal Search Interface */
            <div className="space-y-3">
              {/* Search Controls */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Type animal ID or name to search..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40 h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <span className="capitalize">{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Animal List */}
              {showAnimalList && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-3 border-b bg-gray-50">
                      <div className="text-xs text-gray-600">
                        {filteredAnimals.length} animal{filteredAnimals.length !== 1 ? 's' : ''} found
                        {searchQuery && ` matching "${searchQuery}"`}
                        {categoryFilter !== 'all' && ` in ${categoryFilter}`}
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAnimals.length > 0 ? (
                        filteredAnimals.map((animal, index) => (
                          <button
                            key={animal.id}
                            type="button"
                            onClick={() => handleAnimalSelect(animal.id)}
                            className={`w-full p-3 text-left hover:bg-blue-50 transition-all focus:bg-blue-50 focus:outline-none border-0 ${
                              index !== filteredAnimals.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-medium">
                                  {animal.animal_id}
                                </div>
                                <div>
                                  <div className="text-sm font-medium capitalize">{animal.category}</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {animal.entry_weight ? `${animal.entry_weight}kg` : 'No weight'}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <Search className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No animals found</p>
                          {searchQuery && (
                            <p className="text-xs mt-1 text-gray-400">
                              Try a different search term
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!showAnimalList && (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
                  <div className="text-sm text-gray-600">
                    <Search className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    Start typing to search for animals or use the filter
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slaughter Details - Clean Horizontal Layout */}
      {selectedAnimal && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">Slaughter Information</Label>
          
          <div className="grid grid-cols-4 gap-4 items-start">
            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-2">Date</Label>
              <Input 
                type="date" 
                value={formData.slaughter_date}
                onChange={(e) => handleChange('slaughter_date', e.target.value)}
                className="h-10 w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-2">Slaughter Weight(kg)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="65.5"
                value={formData.slaughter_weight}
                onChange={(e) => handleChange('slaughter_weight', e.target.value)}
                className="h-10 w-full"
              />
              {selectedAnimal?.entry_weight && (
                <p className="text-xs text-blue-600 mt-1">Ratio: {clearanceRatio}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-2">Carcass Weight(kg)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="36.0"
                value={formData.carcass_weight}
                onChange={(e) => handleChange('carcass_weight', e.target.value)}
                className="h-10 w-full"
              />
              <p className="text-xs text-green-600 mt-1">Yield: {carcassPercentage}%</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-2">Selling Price ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="850.00"
                value={formData.selling_price}
                onChange={(e) => handleChange('selling_price', e.target.value)}
                className="h-10 w-full"
              />
            </div>
          </div>
        </div>
      )}

      {selectedAnimal && (
        <div className="pt-4 border-t">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Report...
              </>
            ) : (
              'Create Slaughter Report'
            )}
          </Button>
          
          {/* Debug info - remove in production */}
          <div className="mt-2 text-xs text-gray-500">
            Debug: Animal ID: {formData.animal_id ? '✓' : '✗'} | 
            Weight: {formData.slaughter_weight ? '✓' : '✗'} | 
            Carcass: {formData.carcass_weight ? '✓' : '✗'} | 
            Price: {formData.selling_price ? '✓' : '✗'}
          </div>
        </div>
      )}
    </form>
  )
}
