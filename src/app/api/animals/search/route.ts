import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ animals: [] })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('animals')
    .select(`
      id,
      animal_id,
      category,
      current_stage:stages!current_stage_id(display_name),
      current_room:rooms!current_room_id(identifier)
    `)
    .ilike('animal_id', `%${query}%`)
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ animals: data })
}
