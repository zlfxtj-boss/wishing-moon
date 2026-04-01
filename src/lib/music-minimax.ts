'use client'

// MiniMax Music Generation Service
// API Docs: https://www.minimaxi.com/document/Guides/Generate/Music

export type CardType = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'

// Card ID to CardType mapping
export function getCardType(cardId: number): CardType {
  if (cardId <= 21) return 'major'
  if (cardId <= 35) return 'wands'
  if (cardId <= 49) return 'cups'
  if (cardId <= 63) return 'swords'
  return 'pentacles'
}

// Music prompts for each card type
const MUSIC_PROMPTS: Record<CardType, string> = {
  // Major Arcana - mysterious ethereal, celestial bells, sacred space
  major: 'mysterious ethereal ambient music, celestial bells, sacred space, cosmic atmosphere, soft pad synths',
  // Wands - passionate energetic, drums, fire elements
  wands: 'passionate energetic music, drums, fire elements, rhythmic drums, uplifting mood, dynamic percussion',
  // Cups - gentle emotional, soft piano, water flowing
  cups: 'gentle emotional music, soft piano, water flowing, romantic atmosphere, soothing melody, tender feeling',
  // Swords - tense mysterious, wind, suspended chords
  swords: 'tense mysterious music, wind, suspended chords, atmospheric tension, dark ambient, eerie mood',
  // Pentacles - steady prosperous, earth tones, warm strings
  pentacles: 'steady prosperous music, earth tones, warm strings, grounded feeling, wealth atmosphere, rich orchestration',
}

// Music style display info
export const MUSIC_STYLES: Record<CardType, { description: string; color: string; tempo: number }> = {
  major: {
    description: 'Mysterious & Ethereal',
    color: '#C9A227',
    tempo: 8,
  },
  wands: {
    description: 'Passionate & Energetic',
    color: '#E07B39',
    tempo: 6,
  },
  cups: {
    description: 'Gentle & Emotional',
    color: '#4A90D9',
    tempo: 10,
  },
  swords: {
    description: 'Tense & Mysterious',
    color: '#8E8EAF',
    tempo: 7,
  },
  pentacles: {
    description: 'Steady & Prosperous',
    color: '#27AE60',
    tempo: 9,
  },
}

// Cache configuration
const MUSIC_CACHE_PREFIX = 'music_'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CachedMusic {
  url: string
  timestamp: number
}

// Generate cache key for card type and optional seed
function getCacheKey(cardType: CardType, seed?: string): string {
  const hash = seed ? `${cardType}_${seed}` : cardType
  return `${MUSIC_CACHE_PREFIX}${hash}`
}

// Check if cached music is still valid
function isCacheValid(cached: CachedMusic): boolean {
  return Date.now() - cached.timestamp < CACHE_DURATION_MS
}

// Get cached music URL
export function getCachedMusicUrl(cardType: CardType): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(getCacheKey(cardType))
    if (cached) {
      const parsed: CachedMusic = JSON.parse(cached)
      if (isCacheValid(parsed)) {
        return parsed.url
      }
      // Clean up expired cache
      localStorage.removeItem(getCacheKey(cardType))
    }
  } catch {
    // Ignore cache errors
  }
  return null
}

// Save music URL to cache
function saveMusicToCache(cardType: CardType, url: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const cached: CachedMusic = {
      url,
      timestamp: Date.now(),
    }
    localStorage.setItem(getCacheKey(cardType), JSON.stringify(cached))
  } catch {
    // Ignore cache errors
  }
}

// MiniMax API response types
interface MiniMaxMusicResponse {
  base_resp?: {
    status_code: number
    status_msg: string
  }
  data?: {
    music_id: string
    music_url: string
    status: 'processing' | 'success' | 'failed'
  }
}

// Poll for music generation result
async function pollMusicResult(musicId: string, apiKey: string, maxAttempts = 30): Promise<string | null> {
  const pollEndpoint = `https://api.minimaxi.com/v1/music/query_music`

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(pollEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ music_id: musicId }),
      })

      if (!response.ok) {
        console.warn(`Poll request failed: ${response.status}`)
        await new Promise(r => setTimeout(r, 2000))
        continue
      }

      const data: MiniMaxMusicResponse = await response.json()

      if (data.base_resp?.status_code !== 0) {
        console.warn(`Poll status error: ${data.base_resp?.status_msg}`)
        await new Promise(r => setTimeout(r, 2000))
        continue
      }

      if (data.data?.status === 'success' && data.data?.music_url) {
        return data.data.music_url
      }

      if (data.data?.status === 'failed') {
        console.warn('Music generation failed')
        return null
      }

      // Still processing, wait before next poll
      await new Promise(r => setTimeout(r, 3000))
    } catch (e) {
      console.warn(`Poll error: ${e}`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  return null
}

// Generate music using MiniMax API
export async function generateMiniMaxMusic(
  cardType: CardType,
  apiKey: string
): Promise<{ url: string | null; loading: boolean; error: string | null }> {
  // Check cache first
  const cachedUrl = getCachedMusicUrl(cardType)
  if (cachedUrl) {
    return { url: cachedUrl, loading: false, error: null }
  }

  const prompt = MUSIC_PROMPTS[cardType]
  const generateEndpoint = 'https://api.minimaxi.com/v1/music_generation'

  try {
    // Start music generation
    const response = await fetch(generateEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'music-01',
        prompt: prompt,
        duration: MUSIC_STYLES[cardType].tempo,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`MiniMax API error: ${response.status}`, errorText)
      
      // Check for specific error codes
      if (response.status === 429) {
        return { url: null, loading: false, error: 'Rate limited. Please try again later.' }
      }
      if (response.status === 401 || response.status === 403) {
        return { url: null, loading: false, error: 'Invalid API key.' }
      }
      
      return { url: null, loading: false, error: `API error: ${response.status}` }
    }

    const data: MiniMaxMusicResponse = await response.json()

    if (data.base_resp?.status_code !== 0) {
      return { url: null, loading: false, error: data.base_resp?.status_msg || 'Generation failed' }
    }

    // If music is ready immediately
    if (data.data?.status === 'success' && data.data?.music_url) {
      saveMusicToCache(cardType, data.data.music_url)
      return { url: data.data.music_url, loading: false, error: null }
    }

    // Poll for result if still processing
    if (data.data?.music_id) {
      const musicUrl = await pollMusicResult(data.data.music_id, apiKey)
      if (musicUrl) {
        saveMusicToCache(cardType, musicUrl)
        return { url: musicUrl, loading: false, error: null }
      }
      return { url: null, loading: false, error: 'Music generation timed out.' }
    }

    return { url: null, loading: false, error: 'Unknown response format' }
  } catch (e) {
    console.error('MiniMax music generation error:', e)
    return { url: null, loading: false, error: `Network error: ${e}` }
  }
}

// Check if MiniMax API is configured
export function isMiniMaxConfigured(): boolean {
  if (typeof window === 'undefined') return false
  const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY
  return !!apiKey && apiKey.startsWith('sk-api-')
}
