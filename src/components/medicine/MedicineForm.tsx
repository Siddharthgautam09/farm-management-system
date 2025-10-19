'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMedicineLog } from '@/actions/medicine'
import { Button } from '@/components/ui/button'

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
  drug_volume: z.number().positive().optional(),
  drug_price: z.number().positive().optional(),
  drug_dose: z.number().positive('Dose is required'),
  treatment_days: z.number().int().positive().optional(),
  treatment_start_date: z.string().optional(),
  treatment_end_date: z.string().optional(),
  illness: z.string().optional(),
  quantity_remaining: z.number().nonnegative().optional(),
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
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      drug_name: '',
      drug_type: 'ml' as const,
      drug_dose: 0,
      drug_volume: 0,
      drug_price: 0,
      treatment_days: 0,
      quantity_remaining: 0,
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
    } catch {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Drug Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="drug_company" className="text-sm font-medium">
            Drug Company
          </label>
          <Controller
            name="drug_company"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="drug_company"
                  placeholder="Pharmaceutical company" 
                />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="drug_name" className="text-sm font-medium">
            Drug Name *
          </label>
          <Controller
            name="drug_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="drug_name"
                  placeholder="Medicine name" 
                />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Drug Type & Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="drug_type" className="text-sm font-medium">
            Drug Type *
          </label>
          <Controller
            name="drug_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ML (Milliliter)</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="drug_volume" className="text-sm font-medium">
            Total Volume/Quantity
          </label>
          <Controller
            name="drug_volume"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="drug_volume"
                  type="number" 
                  step="0.01" 
                  placeholder="Total in container"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">Total amount in bottle/pack</p>
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="drug_price" className="text-sm font-medium">
            Price
          </label>
          <Controller
            name="drug_price"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="drug_price"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">Total price of container</p>
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Dosage & Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="drug_dose" className="text-sm font-medium">
            Dose per Administration *
          </label>
          <Controller
            name="drug_dose"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="drug_dose"
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 5 ml"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Amount given per dose</p>
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="treatment_days" className="text-sm font-medium">
            Treatment Days
          </label>
          <Controller
            name="treatment_days"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="treatment_days"
                  type="number" 
                  placeholder="Number of days"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">Duration of treatment</p>
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Treatment Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="treatment_start_date" className="text-sm font-medium">
            Start Date
          </label>
          <Controller
            name="treatment_start_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="treatment_start_date"
                  type="date" 
                />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="treatment_end_date" className="text-sm font-medium">
            End Date
          </label>
          <Controller
            name="treatment_end_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="treatment_end_date"
                  type="date" 
                />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Illness & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="illness" className="text-sm font-medium">
            Illness/Condition
          </label>
          <Controller
            name="illness"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Textarea 
                  {...field} 
                  id="illness"
                  placeholder="Describe the illness or symptoms" 
                />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="quantity_remaining" className="text-sm font-medium">
              Quantity Remaining
            </label>
            <Controller
              name="quantity_remaining"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Input 
                    {...field} 
                    id="quantity_remaining"
                    type="number" 
                    step="0.01" 
                    placeholder="Stock level"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <p className="text-xs text-muted-foreground">Alert if below 5</p>
                  {fieldState.error && (
                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="purchase_date" className="text-sm font-medium">
              Purchase Date
            </label>
            <Controller
              name="purchase_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Input 
                    {...field} 
                    id="purchase_date"
                    type="date" 
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Medicine Record'}
      </Button>
    </form>
  )
}
