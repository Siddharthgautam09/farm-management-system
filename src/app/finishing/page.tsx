import { redirect } from 'next/navigation'

export default function FinishingRedirect() {
  redirect('/protected/finishing')
  return null
}