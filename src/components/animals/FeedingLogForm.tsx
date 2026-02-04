'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addFeedingLog } from '@/actions/feeding'
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

const feedingFormSchema = z.object({
  feed_type: z.enum(['mcr', 'concentrated_feed', 'alfa_alfa', 'hay', 'premix']),
  quantity: z.number().positive('Quantity must be positive'),
  date: z.string().min(1, 'Date is required'),
  cost_per_unit: z.number().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingFormSchema>

interface FeedingLogFormProps {
  roomId: string
  stageId: string
  onSuccess?: () => void
}

export function FeedingLogForm({ roomId, stageId, onSuccess }: FeedingLogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FeedingFormValues>({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: {
      feed_type: 'mcr',
      quantity: undefined,
      date: new Date().toISOString().split('T')[0],
      cost_per_unit: undefined,
      company_name: '',
      notes: '',
    },
  })

  async function onSubmit(values: FeedingFormValues) {
    setIsSubmitting(true)
    try {
      // Prepare the data based on feed type
      const baseData = {
        room_id: roomId,
        stage_id: stageId,
        feed_type: values.feed_type,
        daily_use: values.quantity!,
        date_of_use: values.date,
        company_name: values.company_name || undefined,
      }

      // Add the appropriate price field based on feed type
      const feedingData = { ...baseData } as Record<string, unknown>
      
      if (values.cost_per_unit !== undefined) {
        switch (values.feed_type) {
          case 'mcr':
            feedingData.mcr_price = values.cost_per_unit
            break
          case 'concentrated_feed':
            feedingData.concentrate_price = values.cost_per_unit
            break
          case 'alfa_alfa':
          case 'hay':
            feedingData.bale_price = values.cost_per_unit
            break
          case 'premix':
            feedingData.premix_price = values.cost_per_unit
            break
        }
      }

      const result = await addFeedingLog(feedingData as Parameters<typeof addFeedingLog>[0])

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Feeding log added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Feeding log error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add feeding log',
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
          name="feed_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feed Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mcr">MCR</SelectItem>
                  <SelectItem value="concentrated_feed">Concentrated Feed</SelectItem>
                  <SelectItem value="alfa_alfa">Alfa Alfa</SelectItem>
                  <SelectItem value="hay">Hay</SelectItem>
                  <SelectItem value="premix">Premix</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity (kg) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10.5"
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
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter company name..."
                  {...field}
                />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Feeding Log'}
        </Button>
      </form>
    </Form>
  )
}
