import { redirect } from 'next/navigation'

export default function AnimalPage() {
    redirect('/protected/animals')
    return null
}

