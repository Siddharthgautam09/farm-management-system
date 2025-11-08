import { redirect } from 'next/navigation'

export default function InventoryRedirect() {
  redirect('/protected/inventory')
  return null
}