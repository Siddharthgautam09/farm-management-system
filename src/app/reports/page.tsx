import { redirect } from 'next/navigation'

export default function ReportsRedirect() {
  redirect('/protected/reports')
  return null
}
