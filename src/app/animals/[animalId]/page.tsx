import { redirect } from 'next/navigation'

export default function AnimalIdRedirect({ params }: { params: { animalId: string } }) {
  redirect(`/protected/animals/${params.animalId}`)
  return null
}
