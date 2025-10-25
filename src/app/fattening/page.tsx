import { redirect } from 'next/navigation'

export default function FatteningRedirect() {
  redirect('/protected/fattening')
  return null
}