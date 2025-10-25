import { redirect } from 'next/navigation'

export default function SlaughterRedirect() {
  redirect('/protected/reports/slaughter')
  return null
}
