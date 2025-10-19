import React from 'react';
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSlaughterReport } from '@/actions/slaughter'
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

const slaughterFormSchema = z.object({
  animal_id: z.string().min(1, 'Animal ID is required'),
  slaughter_date: z.string().min(1, 'Date is required'),
  slaughter_weight: z.coerce.number().positive('Weight must be positive'),
  carcass_weight: z.coerce.number().positive('Carcass weight must be positive'),
  selling_price: z.coerce.number().positive().optional(),
}).refine(data => data.carcass_weight <= data.slaughter_weight, {
  message: 'Carcass weight cannot exceed slaughter weight',
  path: ['carcass_weight'],
})

type SlaughterFormValues = z.infer<typeof slaughterFormSchema>

type SlaughterReportFormProps = {
  animalId?: string
  onSuccess?: () => void
}

export function SlaughterReportForm({ animalId, onSuccess }: SlaughterReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [carcassPercentage, setCarcassPercentage] = useState<number | null>(null)

  const form = useForm<SlaughterFormValues>({
  resolver: zodResolver(slaughterFormSchema) as any,
    defaultValues: {
      animal_id: animalId || '',
      slaughter_date: new Date().toISOString().split('T')[0],
      slaughter_weight: undefined,
      carcass_weight: undefined,
      selling_price: undefined,
    },
  })

  // Calculate carcass percentage in real-time
  const slaughterWeight = form.watch('slaughter_weight')
  const carcassWeight = form.watch('carcass_weight')

  React.useEffect(() => {
    if (slaughterWeight && carcassWeight && slaughterWeight > 0) {
      const percentage = (carcassWeight / slaughterWeight) * 100
      setCarcassPercentage(percentage)
    } else {
      setCarcassPercentage(null)
    }
  }, [slaughterWeight, carcassWeight])

  async function onSubmit(values: SlaughterFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createSlaughterReport(values)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Slaughter report created successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create slaughter report',
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
          name="slaughter_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slaughter Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slaughter_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slaughter House Weight (kg) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Live weight at slaughterhouse
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carcass_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carcass Weight (kg) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Dressed carcass weight
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Carcass Percentage Display */}
        {carcassPercentage !== null && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Carcass Clearance Ratio
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {carcassPercentage.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Calculated automatically: (Carcass Weight / Slaughter Weight) × 100
            </p>
          </div>
        )}

        <FormField
            control={form.control}
          name="selling_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>
                Total selling price (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating Report...' : 'Create Slaughter Report'}
        </Button>
      </form>
    </Form>
  )
}
