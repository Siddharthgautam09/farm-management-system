import { redirect } from 'next/navigation'

export default function DeathRedirect() {
  redirect('/protected/reports/death')
  return null
}
