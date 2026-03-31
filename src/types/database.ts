// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          preferred_theme: 'cyberpunk' | 'oil-painting'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string
          avatar_url?: string
          preferred_theme?: 'cyberpunk' | 'oil-painting'
        }
        Update: {
          username?: string
          avatar_url?: string
          preferred_theme?: 'cyberpunk' | 'oil-painting'
        }
      }
      collections: {
        Row: {
          id: number
          user_id: string
          card_id: number
          is_favorite: boolean
          collected_at: string
        }
        Insert: {
          user_id: string
          card_id: number
          is_favorite?: boolean
        }
        Update: {
          is_favorite?: boolean
        }
      }
      daily_draws: {
        Row: {
          id: number
          user_id: string
          card_id: number
          draw_date: string
          draw_count: number
          category: 'love' | 'career' | 'health' | 'spirituality'
          created_at: string
        }
        Insert: {
          user_id: string
          card_id: number
          draw_date?: string
          category?: 'love' | 'career' | 'health' | 'spirituality'
        }
        Update: {
          draw_count?: number
          category?: 'love' | 'career' | 'health' | 'spirituality'
        }
      }
      manifestations: {
        Row: {
          id: number
          user_id: string
          intention: string
          target_moon_phase: string | null
          status: 'active' | 'completed' | 'abandoned'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          user_id: string
          intention: string
          target_moon_phase?: string
        }
        Update: {
          status?: 'active' | 'completed' | 'abandoned'
          completed_at?: string
        }
      }
    }
  }
}
