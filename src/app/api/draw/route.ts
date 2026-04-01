import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getRandomTarotCard, getTarotCardById } from '@/lib/tarot'
import { getMoonPhase } from '@/lib/moon-phase'

const MAX_DAILY_DRAWS = 3

export async function GET(request: NextRequest) {
  try {
    // Check daily draw count for authenticated users
    const supabase = await createClient()
    
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        
        // Get total draws for today
        const { data: todayDraws } = await supabase
          .from('daily_draws')
          .select('draw_count')
          .eq('user_id', user.id)
          .eq('draw_date', today)
        
        const totalDrawsToday = todayDraws?.reduce((sum: number, d: any) => sum + (d.draw_count || 0), 0) || 0
        const remainingDraws = Math.max(0, MAX_DAILY_DRAWS - totalDrawsToday)
        
        return NextResponse.json({ 
          remainingDraws,
          maxDraws: MAX_DAILY_DRAWS,
          totalDrawsToday,
          limitReached: remainingDraws <= 0
        })
      }
    }
    
    // Not authenticated - assume unlimited (or restrict on client side)
    return NextResponse.json({ 
      remainingDraws: MAX_DAILY_DRAWS,
      maxDraws: MAX_DAILY_DRAWS,
      totalDrawsToday: 0,
      limitReached: false
    })
  } catch (error) {
    console.error('Draw count check error:', error)
    return NextResponse.json({ 
      remainingDraws: MAX_DAILY_DRAWS,
      maxDraws: MAX_DAILY_DRAWS,
      totalDrawsToday: 0,
      limitReached: false
    })
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

    // Check if user has reached daily limit
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existingDraws } = await supabase
      .from('daily_draws')
      .select('id, draw_count')
      .eq('user_id', user.id)
      .eq('draw_date', today)
    
    const totalDrawsToday = existingDraws?.reduce((sum: number, d: any) => sum + (d.draw_count || 0), 0) || 0
    
    if (totalDrawsToday >= MAX_DAILY_DRAWS) {
      return NextResponse.json({ 
        error: 'Daily draw limit reached',
        remainingDraws: 0,
        limitReached: true
      }, { status: 429 })
    }

    // Insert new draw record
    const { error: insertError } = await supabase.from('daily_draws').insert({
      user_id: user.id,
      card_id: cardId,
      draw_date: today,
      category,
      draw_count: 1,
    })

    if (insertError) {
      console.error('Insert draw error:', insertError)
      return NextResponse.json({ error: 'Failed to record draw' }, { status: 500 })
    }

    const remainingDraws = MAX_DAILY_DRAWS - totalDrawsToday - 1

    return NextResponse.json({ 
      success: true, 
      card,
      remainingDraws: Math.max(0, remainingDraws),
      limitReached: remainingDraws <= 0
    })
  } catch (error) {
    console.error('Save draw error:', error)
    return NextResponse.json({ error: 'Failed to save draw' }, { status: 500 })
  }
}
