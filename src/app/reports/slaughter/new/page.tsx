import { redirect } from 'next/navigation'

export default function SlaughterNewRedirect() {
  redirect('/protected/reports/slaughter/new')
  return null
}
