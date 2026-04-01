import { createClient } from '@/lib/supabase-client'
import type { TarotCard } from '@/types'

export interface CollectionItem {
  id: number
  card_id: number
  is_favorite: boolean
  collected_at: string
  card_data?: TarotCard
}

export interface HistoryItem {
  id: number
  card_id: number
  draw_date: string
  category: string
  created_at: string
  card_data?: TarotCard
}

export interface CollectionsData {
  collections: CollectionItem[]
  history: HistoryItem[]
}

// Get all collections and history for current user
export async function getCollections(): Promise<CollectionsData> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: collections, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('collected_at', { ascending: false })

  if (error) throw error

  const { data: history } = await supabase
    .from('daily_draws')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return {
    collections: collections || [],
    history: history || [],
  }
}

// Add to favorites
export async function addToFavorites(cardId: number): Promise<void> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('collections')
    .upsert({
      user_id: user.id,
      card_id: cardId,
      is_favorite: true,
    }, {
      onConflict: 'user_id,card_id',
    })

  if (error) throw error
}

// Remove from favorites
export async function removeFromFavorites(cardId: number): Promise<void> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('user_id', user.id)
    .eq('card_id', cardId)

  if (error) throw error
}

// Check if card is favorited
export async function isCardFavorited(cardId: number): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .single()

  return !!data
}
