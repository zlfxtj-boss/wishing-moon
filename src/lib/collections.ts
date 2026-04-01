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
  console.log('[Collections] getCollections called')
  const supabase = createClient()
  
  if (!supabase) {
    console.error('[Collections] Supabase not configured - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error('Supabase not configured')
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('[Collections] User:', user?.id, 'Error:', userError)
  
  if (userError) {
    console.error('[Collections] Auth error:', userError)
    throw new Error('Auth error: ' + userError.message)
  }
  
  if (!user) {
    console.error('[Collections] No user found')
    throw new Error('Not authenticated')
  }

  console.log('[Collections] Fetching collections for user:', user.id)
  
  // Fetch favorites/collections
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('collected_at', { ascending: false })

  console.log('[Collections] Collections result:', collections?.length, 'Error:', collectionsError)
  if (collectionsError) {
    console.error('[Collections] Collections error:', collectionsError)
    throw collectionsError
  }

  // Fetch draw history from daily_draws table
  const { data: history, error: historyError } = await supabase
    .from('daily_draws')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  console.log('[Collections] History result:', history?.length, 'Error:', historyError)

  // Normalize collections data - handle both old and new schema
  const normalizedCollections = (collections || []).map((col: any) => ({
    id: col.id,
    card_id: col.card_id,
    is_favorite: col.is_favorite !== undefined ? col.is_favorite : true, // Default to true for favorites
    collected_at: col.collected_at || col.created_at,
  }))

  // Normalize history data
  const normalizedHistory = (history || []).map((h: any) => ({
    id: h.id,
    card_id: h.card_id,
    draw_date: h.draw_date,
    category: h.category || 'love',
    created_at: h.created_at,
  }))

  return {
    collections: normalizedCollections,
    history: normalizedHistory,
  }
}

// Add to favorites
export async function addToFavorites(cardId: number): Promise<void> {
  console.log('[Collections] addToFavorites called, cardId:', cardId)
  const supabase = createClient()
  
  if (!supabase) {
    console.error('[Collections] Supabase not configured')
    throw new Error('Supabase not configured')
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('[Collections] User:', user?.id, 'Error:', userError)
  
  if (userError) {
    throw new Error('Auth error: ' + userError.message)
  }
  
  if (!user) {
    console.error('[Collections] No user - not authenticated')
    throw new Error('Not authenticated')
  }

  console.log('[Collections] Upserting for user:', user.id, 'cardId:', cardId)
  
  const { data, error } = await supabase
    .from('collections')
    .upsert({
      user_id: user.id,
      card_id: cardId,
      is_favorite: true,
    }, {
      onConflict: 'user_id,card_id',
    })
    .select()

  console.log('[Collections] Upsert result:', data, 'Error:', error)
  
  if (error) {
    console.error('[Collections] Upsert error:', error)
    throw error
  }
  
  console.log('[Collections] Successfully added to favorites!')
}

// Remove from favorites
export async function removeFromFavorites(cardId: number): Promise<void> {
  console.log('[Collections] removeFromFavorites called, cardId:', cardId)
  const supabase = createClient()
  
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // For UUID-based tables, delete by user_id and card_id
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('user_id', user.id)
    .eq('card_id', cardId)

  if (error) {
    console.error('[Collections] Delete error:', error)
    throw error
  }
  
  console.log('[Collections] Successfully removed from favorites!')
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
    .maybeSingle()

  return !!data
}
