'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { animalFormSchema, type AnimalFormValues } from '@/lib/validations/animal'
import { createAnimal } from '@/actions/animals'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type Room = {
  id: string
  identifier: string
  stage_id: string
}

type Stage = {
  id: string
  name: string
  display_name: string
}

type AnimalFormProps = {
  rooms: Room[]
  stages: Stage[]
}

export function AnimalForm({ rooms, stages }: AnimalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      animal_id: '',
      category: undefined,
      incoming_company: '',
      entry_date: new Date().toISOString().split('T')[0],
      old_calf_number: '',
      entry_weight: undefined,
      age_months: undefined,
      purchase_price: undefined,
      initial_room_id: '',
      initial_stage_id: '',
    },
  })

  // Filter rooms based on selected stage
  const selectedStageId = form.watch('initial_stage_id')
  const availableRooms = rooms.filter(room => room.stage_id === selectedStageId)

  async function onSubmit(data: AnimalFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createAnimal(data)
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: `Animal ${data.animal_id} registered successfully!`,
        })
        form.reset()
        router.push(`/animals/${data.animal_id}`)
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Animal ID */}
          <FormField
            control={form.control}
            name="animal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animal ID *</FormLabel>
                <FormControl>
                  <Input placeholder="A123" {...field} />
                </FormControl>
                <FormDescription>
                  Unique identifier for this animal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beef">Beef</SelectItem>
                    <SelectItem value="camel">Camel</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Incoming Company */}
          <FormField
            control={form.control}
            name="incoming_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incoming Company</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entry Date */}
          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Old Calf Number */}
          <FormField
            control={form.control}
            name="old_calf_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Calf Number</FormLabel>
                <FormControl>
                  <Input placeholder="Origin company ID" {...field} />
                </FormControl>
                <FormDescription>
                  ID from the origin company
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entry Weight */}
          <FormField
            control={form.control}
            name="entry_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age (months)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Price */}
          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stage */}
          <FormField
            control={form.control}
            name="initial_stage_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Stage *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room */}
          <FormField
            control={form.control}
            name="initial_room_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Room *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedStageId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.identifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a stage first to see available rooms
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Animal'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
