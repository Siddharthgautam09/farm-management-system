'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addFeedingLog } from '@/actions/feeding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  mcr_quantity: z.number().positive().optional(),
  mcr_price: z.number().positive().optional(),
  protein_percentage: z.number().min(0).max(100).optional(),
  concentrate_quantity: z.number().positive().optional(),
  concentrate_price: z.number().positive().optional(),
  bale_weight: z.number().positive().optional(),
  bale_quantity: z.number().positive().optional(),
  bale_price: z.number().positive().optional(),
  premix_volume: z.string().optional(),
  premix_quantity: z.number().positive().optional(),
  premix_price: z.number().positive().optional(),
  daily_use: z.number().positive(),
  date_of_use: z.string(),
  purchase_date: z.string().optional(),
  stage_id: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingFormSchema>

interface FeedingFormProps {
  roomId: string
  stageId: string
  onSuccess?: () => void
}

export function FeedingForm({ roomId, stageId, onSuccess }: FeedingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FeedingFormValues>({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: {
      feed_type: 'mcr' as const,
      daily_use: 1,
      date_of_use: new Date().toISOString().split('T')[0],
      company_name: '',
      item_name: '',
      mcr_quantity: 0,
      mcr_price: 0,
      protein_percentage: 0,
      concentrate_quantity: 0,
      concentrate_price: 0,
      bale_weight: 0,
      bale_quantity: 0,
      bale_price: 0,
      premix_volume: '',
      premix_quantity: 0,
      premix_price: 0,
      purchase_date: '',
      stage_id: stageId,
    },
  })

  const feedType = watch('feed_type')

  const onSubmit = async (values: FeedingFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await addFeedingLog({
        ...values,
        room_id: roomId,
        stage_id: stageId,
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
        reset()
        router.refresh()
        onSuccess?.()
      }
    } catch {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Feed Type */}
      <div className="space-y-2">
        <Label htmlFor="feed_type">Feed Type *</Label>
        <Controller
          name="feed_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select feed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcr">MCR (Milk Cow Replacement)</SelectItem>
                <SelectItem value="concentrated_feed">Concentrated Feed</SelectItem>
                <SelectItem value="alfa_alfa">Alfa Alfa</SelectItem>
                <SelectItem value="hay">Hay</SelectItem>
                <SelectItem value="premix">Premix / Food Additives</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.feed_type && <p className="text-sm text-red-500">{errors.feed_type.message}</p>}
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Controller
            name="company_name"
            control={control}
            render={({ field }) => (
              <Input 
                placeholder="Feed provider" 
                {...field} 
                value={field.value || ''} 
              />
            )}
          />
          {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="item_name">Item Name</Label>
          <Controller
            name="item_name"
            control={control}
            render={({ field }) => (
              <Input 
                placeholder="Product name" 
                {...field} 
                value={field.value || ''} 
              />
            )}
          />
          {errors.item_name && <p className="text-sm text-red-500">{errors.item_name.message}</p>}
        </div>
      </div>

      {/* MCR Specific Fields */}
      {feedType === 'mcr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
          <div className="space-y-2">
            <Label htmlFor="mcr_quantity">Quantity (bags/kg)</Label>
            <Controller
              name="mcr_quantity"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.mcr_quantity && <p className="text-sm text-red-500">{errors.mcr_quantity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mcr_price">Price per Unit</Label>
            <Controller
              name="mcr_price"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.mcr_price && <p className="text-sm text-red-500">{errors.mcr_price.message}</p>}
          </div>
        </div>
      )}

      {/* Concentrated Feed Fields */}
      {feedType === 'concentrated_feed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-green-50">
          <div className="space-y-2">
            <Label htmlFor="protein_percentage">Protein %</Label>
            <Controller
              name="protein_percentage"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            <p className="text-sm text-gray-500">e.g., 22% for Starter</p>
            {errors.protein_percentage && <p className="text-sm text-red-500">{errors.protein_percentage.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="concentrate_quantity">Quantity (bags)</Label>
            <Controller
              name="concentrate_quantity"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.concentrate_quantity && <p className="text-sm text-red-500">{errors.concentrate_quantity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="concentrate_price">Price per Bag</Label>
            <Controller
              name="concentrate_price"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.concentrate_price && <p className="text-sm text-red-500">{errors.concentrate_price.message}</p>}
          </div>
        </div>
      )}

      {/* Alfa Alfa / Hay Fields */}
      {(feedType === 'alfa_alfa' || feedType === 'hay') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-yellow-50">
          <div className="space-y-2">
            <Label htmlFor="bale_weight">Bale Weight (kg)</Label>
            <Controller
              name="bale_weight"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.bale_weight && <p className="text-sm text-red-500">{errors.bale_weight.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bale_quantity">Bale Quantity</Label>
            <Controller
              name="bale_quantity"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.bale_quantity && <p className="text-sm text-red-500">{errors.bale_quantity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bale_price">Price per Bale</Label>
            <Controller
              name="bale_price"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.bale_price && <p className="text-sm text-red-500">{errors.bale_price.message}</p>}
          </div>
        </div>
      )}

      {/* Premix Fields */}
      {feedType === 'premix' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-purple-50">
          <div className="space-y-2">
            <Label htmlFor="premix_volume">Volume Type</Label>
            <Controller
              name="premix_volume"
              control={control}
              render={({ field }) => (
                <Input 
                  placeholder="Liquid/Powder" 
                  {...field} 
                  value={field.value || ''} 
                />
              )}
            />
            {errors.premix_volume && <p className="text-sm text-red-500">{errors.premix_volume.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="premix_quantity">Quantity</Label>
            <Controller
              name="premix_quantity"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.premix_quantity && <p className="text-sm text-red-500">{errors.premix_quantity.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="premix_price">Price</Label>
            <Controller
              name="premix_price"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errors.premix_price && <p className="text-sm text-red-500">{errors.premix_price.message}</p>}
          </div>
        </div>
      )}

      {/* Usage Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="daily_use">Daily Use *</Label>
          <Controller
            name="daily_use"
            control={control}
            render={({ field }) => (
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Amount used daily" 
                {...field} 
                value={field.value || ''} 
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
              />
            )}
          />
          <p className="text-sm text-gray-500">For this room</p>
          {errors.daily_use && <p className="text-sm text-red-500">{errors.daily_use.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_use">Date of Use *</Label>
          <Controller
            name="date_of_use"
            control={control}
            render={({ field }) => (
              <Input type="date" {...field} />
            )}
          />
          {errors.date_of_use && <p className="text-sm text-red-500">{errors.date_of_use.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Controller
            name="purchase_date"
            control={control}
            render={({ field }) => (
              <Input type="date" {...field} value={field.value || ''} />
            )}
          />
          {errors.purchase_date && <p className="text-sm text-red-500">{errors.purchase_date.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Feeding Record'}
      </Button>
    </form>
  )
}
