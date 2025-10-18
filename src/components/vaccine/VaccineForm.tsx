import React from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { addDays, format } from 'date-fns'

const vaccineFormSchema = z.object({
  vaccine_name: z.string().min(1, 'Vaccine name is required'),
  vaccine_volume: z.coerce.number().positive().optional(),
  vaccine_dose: z.coerce.number().positive('Dose is required'),
  vaccine_price: z.coerce.number().positive().optional(),
  first_dose_date: z.string().optional(),
  second_dose_days_gap: z.coerce.number().int().positive().optional(),
  batch_from_animal_id: z.string().optional(),
  batch_to_animal_id: z.string().optional(),
  purchase_date: z.string().optional(),
})

type VaccineFormValues = z.infer<typeof vaccineFormSchema>

type VaccineFormProps = {
  animalId: string
  roomId: string
  stageId: string
  onSuccess?: () => void
}

export function VaccineForm({ animalId, roomId, stageId, onSuccess }: VaccineFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedSecondDose, setCalculatedSecondDose] = useState<string>('')

  const form = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineFormSchema) as any,
    defaultValues: {
      vaccine_name: '',
      vaccine_dose: undefined,
      first_dose_date: new Date().toISOString().split('T')[0],
    },
  })

  // Auto-calculate second dose date
  const firstDoseDate = form.watch('first_dose_date')
  const daysGap = form.watch('second_dose_days_gap')

  React.useEffect(() => {
    if (firstDoseDate && daysGap) {
      const first = new Date(firstDoseDate)
      const second = addDays(first, daysGap)
      setCalculatedSecondDose(format(second, 'MMM dd, yyyy'))
    } else {
      setCalculatedSecondDose('')
    }
  }, [firstDoseDate, daysGap])

  async function onSubmit(values: VaccineFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addVaccineLog({
        animal_id: animalId,
        room_id: roomId,
        stage_id: stageId,
        ...values,
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
          description: 'Vaccine record added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add vaccine record',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        {/* Vaccine Information */}
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

        {/* Volume, Dose, Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vaccine_volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Volume (ML)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Total in bottle" {...field} />
                </FormControl>
                <FormDescription>
                  Total amount in container
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vaccine_dose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dose per Animal (ML) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 2" {...field} />
                </FormControl>
                <FormDescription>
                  Amount per dose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vaccine_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Total bottle price
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dosing Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_dose_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Dose Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="second_dose_days_gap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days Until Second Dose</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 21 days" {...field} />
                </FormControl>
                <FormDescription>
                  {calculatedSecondDose && (
                    <span className="text-blue-600 font-medium">
                      Second dose: {calculatedSecondDose}
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Batch Vaccination (Optional) */}
        <div className="p-4 border rounded-lg bg-purple-50 space-y-4">
          <h4 className="font-medium text-sm">Batch Vaccination (Optional)</h4>
          <p className="text-xs text-gray-600">
            If vaccinating multiple animals at once, specify the ID range
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="batch_from_animal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Animal ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batch_to_animal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Animal ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A950" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Vaccine Record'}
        </Button>
      </form>
    </Form>
  )
}
