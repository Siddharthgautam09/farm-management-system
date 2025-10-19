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
  FormDescription,
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

const medicineFormSchema = z.object({
  drug_company: z.string().optional(),
  drug_name: z.string().min(1, 'Drug name is required'),
  drug_type: z.enum(['ml', 'tablet', 'gram', 'injection']),
  drug_volume: z.coerce.number().positive().optional(),
  drug_price: z.coerce.number().positive().optional(),
  drug_dose: z.coerce.number().positive('Dose is required'),
  treatment_days: z.coerce.number().int().positive().optional(),
  treatment_start_date: z.string().optional(),
  treatment_end_date: z.string().optional(),
  illness: z.string().optional(),
  quantity_remaining: z.coerce.number().nonnegative().optional(),
  purchase_date: z.string().optional(),
})

type MedicineFormValues = z.infer<typeof medicineFormSchema>

type MedicineFormProps = {
  animalId: string
  roomId: string
  stageId: string
  onSuccess?: () => void
}

export function MedicineForm({ animalId, roomId, stageId, onSuccess }: MedicineFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema) as any,
    defaultValues: {
      drug_name: '',
      drug_type: undefined,
      drug_dose: undefined,
      treatment_start_date: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(values: MedicineFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addMedicineLog({
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
          description: 'Medicine record added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add medicine record',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Drug Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="drug_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drug Company</FormLabel>
                <FormControl>
                  <Input placeholder="Pharmaceutical company" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drug_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drug Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Medicine name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Drug Type & Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="drug_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drug Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ml">ML (Milliliter)</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drug_volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Volume/Quantity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Total in container" {...field} />
                </FormControl>
                <FormDescription>
                  Total amount in bottle/pack
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drug_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Total price of container
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dosage & Treatment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="drug_dose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dose per Administration *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 5 ml" {...field} />
                </FormControl>
                <FormDescription>
                  Amount given per dose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatment_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment Days</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Number of days" {...field} />
                </FormControl>
                <FormDescription>
                  Duration of treatment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Treatment Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="treatment_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatment_end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Illness & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="illness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Illness/Condition</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the illness or symptoms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="quantity_remaining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Remaining</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Stock level" {...field} />
                  </FormControl>
                  <FormDescription>
                    Alert if below 5
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Medicine Record'}
        </Button>
      </form>
    </Form>
  )
}
