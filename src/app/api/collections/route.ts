import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getTarotCardById, tarotCards } from '@/lib/tarot'

// GET: List user's collections
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: collections, error } = await supabase
      .from('collections')
      .select('*, tarot_cards(*)')
      .eq('user_id', user.id)
      .order('collected_at', { ascending: false })

    if (error) throw error

    // Also fetch draw history
    const { data: drawHistory } = await supabase
      .from('daily_draws')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // Enrich with card data from our JSON
    const enrichedCollections = (collections || []).map((col: any) => {
      const card = getTarotCardById(col.card_id)
      return { ...col, card_data: card }
    })

    const enrichedHistory = (drawHistory || []).map((draw: any) => {
      const card = getTarotCardById(draw.card_id)
      return { ...draw, card_data: card }
    })

    return NextResponse.json({
      collections: enrichedCollections,
      history: enrichedHistory,
    })
  } catch (error) {
    console.error('Collections error:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

// POST: Add to collections (favorite)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, isFavorite = true } = body

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const card = getTarotCardById(cardId)
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Upsert collection
    const { data, error } = await supabase
      .from('collections')
      .upsert({
        user_id: user.id,
        card_id: cardId,
        is_favorite: isFavorite,
      }, {
        onConflict: 'user_id,card_id',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, collection: { ...data, card_data: card } })
  } catch (error) {
    console.error('Add collection error:', error)
    return NextResponse.json({ error: 'Failed to add to collection' }, { status: 500 })
  }
}

// DELETE: Remove from collections
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('user_id', user.id)
      .eq('card_id', parseInt(cardId))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove collection error:', error)
    return NextResponse.json({ error: 'Failed to remove from collection' }, { status: 500 })
  }
}
