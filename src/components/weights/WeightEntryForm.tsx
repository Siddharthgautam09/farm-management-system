'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addWeightRecord } from '@/actions/weights'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const weightFormSchema = z.object({
  weight: z.string().min(1, 'Weight is required'),
  recorded_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type WeightFormValues = z.infer<typeof weightFormSchema>

type WeightEntryFormProps = {
  animalId: string
  currentStageId: string
  currentRoomId: string
  onSuccess?: () => void
}

export function WeightEntryForm({
  animalId,
  currentStageId,
  currentRoomId,
  onSuccess,
}: WeightEntryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: '',
      recorded_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  async function onSubmit(values: WeightFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addWeightRecord({
        animal_id: animalId,
        stage_id: currentStageId,
        room_id: currentRoomId,
        weight: parseFloat(values.weight),
        recorded_date: values.recorded_date,
        notes: values.notes,
      })

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Weight record added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add weight record',
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
          name="weight"
          render={({ field }: { field: import('react-hook-form').ControllerRenderProps<WeightFormValues, 'weight'> }) => (
              <FormItem>
                <FormLabel>Weight (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recorded_date"
          render={({ field }: { field: import('react-hook-form').ControllerRenderProps<WeightFormValues, 'recorded_date'> }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: import('react-hook-form').ControllerRenderProps<WeightFormValues, 'notes'> }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this weight measurement..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about the measurement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Weight Record'}
        </Button>
      </form>
    </Form>
  )
}
