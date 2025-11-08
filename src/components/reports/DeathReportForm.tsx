'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeathReport } from '@/actions/reports'
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

const deathFormSchema = z.object({
  animal_id: z.string().min(1, 'Animal is required'),
  death_date: z.string().min(1, 'Date is required'),
  cause: z.string().min(1, 'Cause of death is required'),
  notes: z.string().optional(),
})

type DeathFormValues = z.infer<typeof deathFormSchema>

type Animal = {
  id: string
  animal_id: string
  category: string
}

type DeathReportFormProps = {
  animals: Animal[]
}

const deathCauses = [
  'Illness',
  'Injury',
  'Natural Causes',
  'Complications',
  'Unknown',
  'Other',
]

export function DeathReportForm({ animals }: DeathReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DeathFormValues>({
    resolver: zodResolver(deathFormSchema),
    defaultValues: {
      animal_id: '',
      death_date: new Date().toISOString().split('T')[0],
      cause: '',
      notes: '',
    },
  })

  async function onSubmit(values: DeathFormValues) {
    setIsSubmitting(true)
    try {
      console.log('Submitting death report:', values)
      const result = await createDeathReport(values)

      if (result.error) {
        console.error('Death report error:', result.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        console.log('Death report created successfully:', result)
        toast({
          title: 'Success',
          description: 'Death report created successfully',
        })
        router.push('/protected/reports/death')
        router.refresh()
      }
    } catch (error) {
      console.error('Death report submission error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create death report',
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
              <FormLabel>Animal *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.animal_id} ({animal.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="death_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Death Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of Death *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deathCauses.map((cause) => (
                    <SelectItem key={cause} value={cause}>
                      {cause}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Additional details about the death..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating...' : 'Create Death Report'}
        </Button>
      </form>
    </Form>
  )
}
