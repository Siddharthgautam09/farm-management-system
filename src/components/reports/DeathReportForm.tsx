'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeathReport } from '@/actions/death'
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

const deathFormSchema = z.object({
  animal_id: z.string().min(1, 'Animal ID is required'),
  death_date: z.string().min(1, 'Date is required'),
  last_weight: z.number().positive().optional(),
  cause_of_death: z.string().optional(),
  notes: z.string().optional(),
})

type DeathFormValues = z.infer<typeof deathFormSchema>

type DeathReportFormProps = {
  animalId?: string
  onSuccess?: () => void
}

export function DeathReportForm({ animalId, onSuccess }: DeathReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DeathFormValues>({
    resolver: zodResolver(deathFormSchema),
    defaultValues: {
      animal_id: animalId || '',
      death_date: new Date().toISOString().split('T')[0],
      last_weight: undefined,
      cause_of_death: '',
      notes: '',
    },
  })

  async function onSubmit(values: DeathFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createDeathReport(values)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Death report created successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
  } catch {
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
              <FormLabel>Animal ID *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A123" {...field} disabled={!!animalId} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="death_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Death *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Recorded Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>
                Last known weight before death
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cause_of_death"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of Death</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Disease, Injury, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about the circumstances..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating Report...' : 'Create Death Report'}
        </Button>
      </form>
    </Form>
  )
}
