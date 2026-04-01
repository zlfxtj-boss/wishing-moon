import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRandomTarotCard, getTarotCardById } from '@/lib/tarot'
import { getMoonPhase } from '@/lib/moon-phase'

export async function GET(request: NextRequest) {
  try {
    const card = getRandomTarotCard()
    const moonPhase = getMoonPhase()

    return NextResponse.json({ card, moonPhase })
  } catch (error) {
    console.error('Draw API error:', error)
    return NextResponse.json({ error: 'Failed to draw card' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.error('Supabase client null in POST /api/draw')
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('POST /api/draw auth:', { userId: user?.id, authError })

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, category = 'love' } = body

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const card = getTarotCardById(cardId)
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Check if user already drew this card today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingDraw } = await supabase
      .from('daily_draws')
      .select('*')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .eq('draw_date', today)
      .single()

    if (existingDraw) {
      // Update draw count
      await supabase
        .from('daily_draws')
        .update({ draw_count: existingDraw.draw_count + 1, category })
        .eq('id', existingDraw.id)
    } else {
      // Insert new draw
      await supabase.from('daily_draws').insert({
        user_id: user.id,
        card_id: cardId,
        draw_date: today,
        category,
        draw_count: 1,
      })
    }

    return NextResponse.json({ success: true, card })
  } catch (error) {
    console.error('Save draw error:', error)
    return NextResponse.json({ error: 'Failed to save draw' }, { status: 500 })
  }
}
