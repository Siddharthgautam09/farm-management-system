'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInventoryItem } from '@/actions/inventory'
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

const inventoryFormSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  category: z.enum(['feed', 'medicine', 'vaccine', 'supplies', 'other']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.coerce.number().positive('Price must be positive'),
  alert_threshold: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
})

type InventoryFormValues = z.infer<typeof inventoryFormSchema>

export function InventoryForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema) as any,
    defaultValues: {
      product_name: '',
      category: 'feed' as const,
      quantity: '' as any,
      unit: '',
      price: '' as any,
      alert_threshold: '' as any,
      notes: '',
    },
  })

  async function onSubmit(values: InventoryFormValues) {
    console.log('Form submitted with values:', values)
    setIsSubmitting(true)
    try {
      const result = await createInventoryItem(values)
      console.log('Create inventory result:', result)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Inventory item added successfully',
        })
        form.reset()
        router.refresh()
        // Close the dialog by triggering a click on the close button
        const closeButton = document.querySelector('[data-dialog-close]') as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add inventory item',
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
          name="product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MCR Feed Bags" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="vaccine">Vaccine</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., bags, bottles, kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alert_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Alert when quantity falls below</FormDescription>
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
                <Textarea
                  placeholder="Additional notes about this item..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding...' : 'Add Inventory Item'}
        </Button>
      </form>
    </Form>
  )
}
