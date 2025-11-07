'use client'

import { useState } from 'react'
import { createSlaughterReport } from '@/actions/reports'
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
import { useToast } from '@/hooks/use-toast'

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
  const [formData, setFormData] = useState({
    animal_id: '',
    slaughter_date: new Date().toISOString().split('T')[0],
    slaughter_weight: '',
    carcass_weight: '',
    selling_price: '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Basic validation
    if (!formData.animal_id || !formData.slaughter_weight || !formData.carcass_weight || !formData.selling_price) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill all required fields',
      })
      return
    }

    // Validate numbers
    const slaughterWeight = Number(formData.slaughter_weight)
    const carcassWeight = Number(formData.carcass_weight)
    const sellingPrice = Number(formData.selling_price)

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Animal *</Label>
        <Select onValueChange={(value) => handleChange('animal_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map((animal) => (
              <SelectItem key={animal.id} value={animal.id}>
                {animal.animal_id} ({animal.category})
                {animal.entry_weight && ` - Entry: ${animal.entry_weight}kg`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Slaughter Date *</Label>
        <Input 
          type="date" 
          value={formData.slaughter_date}
          onChange={(e) => handleChange('slaughter_date', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Slaughter Weight (kg) *</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="65.5"
            value={formData.slaughter_weight}
            onChange={(e) => handleChange('slaughter_weight', e.target.value)}
          />
          {selectedAnimal?.entry_weight && (
            <p className="text-sm text-gray-600">Clearance Ratio: {clearanceRatio}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Carcass Weight (kg) *</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="36.0"
            value={formData.carcass_weight}
            onChange={(e) => handleChange('carcass_weight', e.target.value)}
          />
          <p className="text-sm text-gray-600">Carcass %: {carcassPercentage}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Selling Price *</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="850.00"
          value={formData.selling_price}
          onChange={(e) => handleChange('selling_price', e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating Report...' : 'Create Slaughter Report'}
      </Button>
    </form>
  )
}
