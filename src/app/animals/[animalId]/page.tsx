import { redirect } from 'next/navigation'

export default async function AnimalIdRedirect({ params }: { params: Promise<{ animalId: string }> }) {
  const { animalId } = await params
  redirect(`/protected/animals/${animalId}`)
  return null
}
