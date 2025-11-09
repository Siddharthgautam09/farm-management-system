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
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().positive('Price must be positive'),
  alert_threshold: z.number().positive().optional(),
  notes: z.string().optional(),
})

type InventoryFormValues = z.infer<typeof inventoryFormSchema>

type InventoryFormProps = {
  onSuccess?: () => void
}

export function InventoryForm(props?: InventoryFormProps) {
  const { onSuccess } = props || {}
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      product_name: '',
      category: 'feed',
      quantity: undefined as any,
      unit: '',
      price: undefined as any,
      alert_threshold: undefined,
      notes: '',
    },
  })

  async function onSubmit(values: InventoryFormValues) {
    console.log('=== INVENTORY FORM SUBMISSION ===')
    console.log('Form submitted with values:', values)
    console.log('Form validation state:', form.formState.errors)
    
    setIsSubmitting(true)
    try {
      console.log('Calling createInventoryItem action...')
      const result = await createInventoryItem(values)
      console.log('Create inventory result:', result)

      if (result.error) {
        console.error('Error from action:', result.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        console.log('Success! Item created:', result.item)
        toast({
          title: 'Success',
          description: 'Inventory item added successfully',
        })
        form.reset()
        if (onSuccess) {
          console.log('Calling onSuccess callback')
          onSuccess()
        } else {
          console.log('Redirecting to /protected/inventory')
          router.push('/protected/inventory')
          router.refresh()
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
      <form 
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered')
          console.log('Form values:', form.getValues())
          console.log('Form errors:', form.formState.errors)
          form.handleSubmit(onSubmit)(e)
        }} 
        className="space-y-4"
      >
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
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || val === null) {
                        field.onChange(undefined)
                      } else {
                        const num = parseFloat(val)
                        field.onChange(isNaN(num) ? undefined : num)
                      }
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || val === null) {
                        field.onChange(undefined)
                      } else {
                        const num = parseFloat(val)
                        field.onChange(isNaN(num) ? undefined : num)
                      }
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber
                      field.onChange(isNaN(value) ? undefined : value)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
