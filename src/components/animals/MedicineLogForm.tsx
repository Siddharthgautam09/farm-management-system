'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMedicineLog } from '@/actions/medicine'
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

const medicineFormSchema = z.object({
  drug_name: z.string().min(1, 'Drug name is required'),
  dosage: z.number().positive('Dosage must be positive'),
  date: z.string().min(1, 'Date is required'),
  drug_company: z.string().optional(),
  drug_cost: z.number().optional(),
  administered_by: z.string().optional(),
  notes: z.string().optional(),
})

type MedicineFormValues = z.infer<typeof medicineFormSchema>

type MedicineLogFormProps = {
  animalId: string
  onSuccess?: () => void
}

export function MedicineLogForm({ animalId, onSuccess }: MedicineLogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      drug_name: '',
      dosage: undefined,
      date: new Date().toISOString().split('T')[0],
      drug_company: '',
      drug_cost: undefined,
      administered_by: '',
      notes: '',
    },
  })

  async function onSubmit(values: MedicineFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addMedicineLog({
        animal_id: animalId,
        room_id: '', // You may need to pass room_id as a prop
        stage_id: '', // You may need to pass stage_id as a prop
        drug_name: values.drug_name,
        drug_type: 'ml' as const,
        drug_dose: values.dosage,
        drug_company: values.drug_company,
        drug_price: values.drug_cost,
        treatment_start_date: values.date,
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
          description: 'Medicine log added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add medicine log',
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
          name="drug_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Amoxicillin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage (ml/mg) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
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
            name="drug_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drug Company</FormLabel>
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
            name="drug_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drug Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="50.00"
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
          {isSubmitting ? 'Adding...' : 'Add Medicine Log'}
        </Button>
      </form>
    </Form>
  )
}
