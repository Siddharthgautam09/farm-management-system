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

const feedingFormSchema = z.object({
  feed_type: z.enum(['mcr', 'concentrated_feed', 'alfa_alfa', 'hay', 'premix']),
  company_name: z.string().optional(),
  item_name: z.string().optional(),
  
  // MCR fields
  mcr_quantity: z.coerce.number().positive().optional(),
  mcr_price: z.coerce.number().positive().optional(),
  
  // Concentrated Feed
  protein_percentage: z.coerce.number().min(0).max(100).optional(),
  concentrate_quantity: z.coerce.number().positive().optional(),
  concentrate_price: z.coerce.number().positive().optional(),
  
  // Alfa Alfa / Hay
  bale_weight: z.coerce.number().positive().optional(),
  bale_quantity: z.coerce.number().int().positive().optional(),
  bale_price: z.coerce.number().positive().optional(),
  
  // Premix
  premix_volume: z.string().optional(),
  premix_quantity: z.coerce.number().positive().optional(),
  premix_price: z.coerce.number().positive().optional(),
  
  daily_use: z.coerce.number().positive(),
  date_of_use: z.string().min(1),
  purchase_date: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingFormSchema>

type FeedingFormProps = {
  roomId: string
  stageId: string
  onSuccess?: () => void
}

export function FeedingForm({ roomId, stageId, onSuccess }: FeedingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FeedingFormValues>({
    resolver: zodResolver(feedingFormSchema) as any,
    defaultValues: {
      feed_type: 'mcr',
      daily_use: 1,
      date_of_use: new Date().toISOString().split('T')[0],
      company_name: '',
      item_name: '',
      mcr_quantity: undefined,
      mcr_price: undefined,
      protein_percentage: undefined,
      concentrate_quantity: undefined,
      concentrate_price: undefined,
      bale_weight: undefined,
      bale_quantity: undefined,
      bale_price: undefined,
      premix_volume: '',
      premix_quantity: undefined,
      premix_price: undefined,
      purchase_date: '',
    },
  })

  const feedType = form.watch('feed_type')

  async function onSubmit(values: FeedingFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addFeedingLog({
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
          description: 'Feeding log added successfully',
        })
        form.reset()
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add feeding log',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        {/* Feed Type */}
        <FormField<FeedingFormValues>
          control={form.control}
          name="feed_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feed Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mcr">MCR (Milk Cow Replacement)</SelectItem>
                  <SelectItem value="concentrated_feed">Concentrated Feed</SelectItem>
                  <SelectItem value="alfa_alfa">Alfa Alfa</SelectItem>
                  <SelectItem value="hay">Hay</SelectItem>
                  <SelectItem value="premix">Premix / Food Additives</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<FeedingFormValues>
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Feed provider" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<FeedingFormValues>
            control={form.control}
            name="item_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* MCR Specific Fields */}
        {feedType === 'mcr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
          <FormField<FeedingFormValues>
              control={form.control}
              name="mcr_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (bags/kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="mcr_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Concentrated Feed Fields */}
        {feedType === 'concentrated_feed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-green-50">
          <FormField<FeedingFormValues>
              control={form.control}
              name="protein_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    e.g., 22% for Starter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="concentrate_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (bags)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="concentrate_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Bag</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Alfa Alfa / Hay Fields */}
        {(feedType === 'alfa_alfa' || feedType === 'hay') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-yellow-50">
          <FormField<FeedingFormValues>
              control={form.control}
              name="bale_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bale Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="bale_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bale Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="bale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Bale</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Premix Fields */}
        {feedType === 'premix' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-purple-50">
          <FormField<FeedingFormValues>
              control={form.control}
              name="premix_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Liquid/Powder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="premix_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField<FeedingFormValues>
              control={form.control}
              name="premix_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Usage Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField<FeedingFormValues>
            control={form.control}
            name="daily_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Use *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Amount used daily" {...field} />
                </FormControl>
                <FormDescription>
                  For this room
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField<FeedingFormValues>
            control={form.control}
            name="date_of_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Use *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField<FeedingFormValues>
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Feeding Record'}
        </Button>
      </form>
    </Form>
  )
}
