import { redirect } from 'next/navigation'

export default function AnimalNewRedirect() {
  redirect('/protected/animals/new')
}