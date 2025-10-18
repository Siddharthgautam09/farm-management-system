import { z } from 'zod'

export const animalFormSchema = z.object({
  animal_id: z.string().min(1, 'Animal ID is required'),
  category: z.enum(['beef', 'camel', 'sheep', 'goat'], {
    message: 'Please select an animal category',
  }),
  incoming_company: z.string().optional(),
  entry_date: z.string().min(1, 'Entry date is required'),
  old_calf_number: z.string().optional(),
  entry_weight: z.number().positive().optional(),
  age_months: z.number().positive().optional(),
  purchase_price: z.number().positive().optional(),
  initial_room_id: z.string().min(1, 'Please select a room'),
  initial_stage_id: z.string().min(1, 'Please select a stage'),
})

export type AnimalFormValues = z.infer<typeof animalFormSchema>
