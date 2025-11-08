import { redirect } from 'next/navigation'

export default function NewDeathRedirect() {
  redirect('/protected/reports/death/new')
  return null
}
