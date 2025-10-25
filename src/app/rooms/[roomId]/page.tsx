import { redirect } from 'next/navigation'

export default async function RoomIdRedirect({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  redirect(`/protected/rooms/${roomId}`)
  return null
}