'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createDeathReport } from '@/actions/reports'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter } from 'lucide-react'

const deathFormSchema = z.object({
  animal_id: z.string().min(1, 'Animal is required'),
  death_date: z.string().min(1, 'Date is required'),
  cause: z.string().min(1, 'Cause of death is required'),
  notes: z.string().optional(),
})

type DeathFormValues = z.infer<typeof deathFormSchema>

type Animal = {
  id: string
  animal_id: string
  category: string
}

type DeathReportFormProps = {
  animals: Animal[]
  onSuccess?: () => void
  onCancel?: () => void
}

const deathCauses = [
  'Illness',
  'Injury',
  'Natural Causes',
  'Complications',
  'Unknown',
  'Other',
]

export function DeathReportForm({ animals, onSuccess, onCancel }: DeathReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(animals.map(animal => animal.category)))
  }, [animals])

  // Filter animals based on search and category
  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesSearch = searchQuery === '' || 
        animal.animal_id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || animal.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [animals, searchQuery, categoryFilter])

  const form = useForm<DeathFormValues>({
    resolver: zodResolver(deathFormSchema),
    defaultValues: {
      animal_id: '',
      death_date: new Date().toISOString().split('T')[0],
      cause: '',
      notes: '',
    },
  })

  async function onSubmit(values: DeathFormValues) {
    setIsSubmitting(true)
    try {
      console.log('Submitting death report:', values)
      const result = await createDeathReport(values)

      if (result.error) {
        console.error('Death report error:', result.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        console.log('Death report created successfully:', result)
        toast({
          title: 'Success',
          description: 'Death report created successfully',
        })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/protected/reports/death')
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Death report submission error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create death report',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="animal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal *</FormLabel>
              
              {/* Search and Filter */}
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by Animal ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <span className="capitalize">{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.animal_id} ({animal.category})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-500">
                      No animals found matching filters
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="death_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Death Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of Death *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deathCauses.map((cause) => (
                    <SelectItem key={cause} value={cause}>
                      {cause}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about the death..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className={onCancel ? 'flex-1' : 'w-full'}>
            {isSubmitting ? 'Creating...' : 'Create Death Report'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
