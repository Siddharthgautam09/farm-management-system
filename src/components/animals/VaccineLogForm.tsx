'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addVaccineLog } from '@/actions/vaccine'
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
import { useToast } from '@/hooks/use-toast'

const vaccineFormSchema = z.object({
  vaccine_name: z.string().min(1, 'Vaccine name is required'),
  date: z.string().min(1, 'Date is required'),
  vaccine_company: z.string().optional(),
  vaccine_cost: z.number().optional(),
  administered_by: z.string().optional(),
  notes: z.string().optional(),
})

type VaccineFormValues = z.infer<typeof vaccineFormSchema>

type VaccineLogFormProps = {
  animalId: string
  onSuccess?: () => void
}

export function VaccineLogForm({ animalId, onSuccess }: VaccineLogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineFormSchema),
    defaultValues: {
      vaccine_name: '',
      date: new Date().toISOString().split('T')[0],
      vaccine_company: '',
      vaccine_cost: undefined,
      administered_by: '',
      notes: '',
    },
  })

  async function onSubmit(values: VaccineFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addVaccineLog({
        animal_id: animalId,
        room_id: '', // You may need to pass room_id as a prop
        stage_id: '', // You may need to pass stage_id as a prop
        vaccine_name: values.vaccine_name,
        vaccine_dose: 1,
        vaccine_price: values.vaccine_cost,
        first_dose_date: values.date,
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
          description: 'Vaccine log added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add vaccine log',
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
          name="vaccine_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vaccine Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., FMD Vaccine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
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
            name="vaccine_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vaccine Company</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vaccine_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vaccine Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="administered_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Administered By</FormLabel>
                <FormControl>
                  <Input placeholder="Veterinarian name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Vaccine Log'}
        </Button>
      </form>
    </Form>
  )
}
