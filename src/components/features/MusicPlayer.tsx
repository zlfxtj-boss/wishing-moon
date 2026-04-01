'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import {
  getCardType,
  MUSIC_STYLES,
  generateMiniMaxMusic,
  isMiniMaxConfigured,
  type CardType,
} from '@/lib/music-minimax'

// Legacy type alias for internal use
type LegacyCardType = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'

// Music configurations for each card type (used by Web Audio fallback)
const LEGACY_MUSIC_STYLES: Record<LegacyCardType, { notes: number[], tempo: number; description: string; color: string }> = {
  major: {
    notes: [130.81, 196.00, 261.63, 392.00, 523.25, 784.00],
    tempo: 8,
    description: 'Mysterious & Ethereal',
    color: '#C9A227',
  },
  wands: {
    notes: [261.63, 329.63, 392.00, 523.25, 659.25],
    tempo: 6,
    description: 'Passionate & Energetic',
    color: '#E07B39',
  },
  cups: {
    notes: [220.00, 261.63, 329.63, 440.00, 523.25],
    tempo: 10,
    description: 'Gentle & Emotional',
    color: '#4A90D9',
  },
  swords: {
    notes: [146.83, 174.61, 220.00, 293.66, 349.23],
    tempo: 7,
    description: 'Tense & Mysterious',
    color: '#8E8EAF',
  },
  pentacles: {
    notes: [196.00, 246.94, 293.66, 392.00, 493.88],
    tempo: 9,
    description: 'Steady & Prosperous',
    color: '#27AE60',
  },
}

// Create ambient music generator with card-specific style (Web Audio fallback)
const createCardMusic = (
  audioContext: AudioContext,
  cardType: LegacyCardType,
  volume: number = 0.15
): (() => void) => {
  const style = LEGACY_MUSIC_STYLES[cardType]
  const masterGain = audioContext.createGain()
  masterGain.gain.setValueAtTime(volume, audioContext.currentTime)
  masterGain.connect(audioContext.destination)

  const fadeOutStart = audioContext.currentTime + style.tempo - 2
  masterGain.gain.setValueAtTime(volume, audioContext.currentTime)
  masterGain.gain.linearRampToValueAtTime(volume * 0.8, fadeOutStart)
  masterGain.gain.linearRampToValueAtTime(0, fadeOutStart + 2)

  const createOscillator = (
    freq: number,
    type: OscillatorType,
    delay: number,
    gainValue: number,
    filterFreq: number = 800
  ) => {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    osc.type = type
    osc.frequency.setValueAtTime(freq, audioContext.currentTime)
    osc.frequency.linearRampToValueAtTime(freq * 1.015, audioContext.currentTime + style.tempo / 2)
    osc.frequency.linearRampToValueAtTime(freq * 0.985, audioContext.currentTime + style.tempo)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(filterFreq, audioContext.currentTime)
    filter.Q.setValueAtTime(1, audioContext.currentTime)

    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + delay + 1)
    gain.gain.linearRampToValueAtTime(gainValue * 0.6, audioContext.currentTime + delay + style.tempo / 2)
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + style.tempo)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(audioContext.currentTime + delay)
    osc.stop(audioContext.currentTime + style.tempo + 0.5)

    return osc
  }

  const notes = style.notes
  
  createOscillator(notes[0] / 2, 'sine', 0, 0.5, 400)
  
  notes.slice(0, 3).forEach((freq, i) => {
    createOscillator(freq, 'sine', i * 0.5, 0.4 / (i + 1), 600)
    createOscillator(freq * 2, 'triangle', i * 0.5 + 0.3, 0.15 / (i + 1), 500)
  })

  notes.slice(2, 5).forEach((freq, i) => {
    createOscillator(freq, 'sine', i * 0.3 + 1, 0.25 / (i + 1), 1200)
  })

  if (cardType === 'major') {
    createOscillator(notes[1], 'sine', 1.5, 0.3, 700)
    createOscillator(notes[1] * 1.5, 'triangle', 2, 0.2, 900)
  } else if (cardType === 'wands') {
    createOscillator(notes[2], 'sawtooth', 0.5, 0.15, 400)
    createOscillator(notes[2] * 1.01, 'sawtooth', 0.7, 0.1, 400)
  } else if (cardType === 'cups') {
    createOscillator(notes[1] * 1.25, 'sine', 2, 0.2, 500)
    createOscillator(notes[2] * 0.75, 'triangle', 3, 0.15, 600)
  } else if (cardType === 'swords') {
    createOscillator(notes[0] * 1.414, 'square', 1, 0.1, 300)
    createOscillator(notes[1] * 1.414, 'square', 2, 0.1, 300)
  } else if (cardType === 'pentacles') {
    createOscillator(notes[0] * 2, 'triangle', 0, 0.3, 500)
    createOscillator(notes[0] * 3, 'sine', 1, 0.15, 400)
  }

  return () => {
    masterGain.disconnect()
  }
}

const MUSIC_STORAGE_KEY = 'wishing-moon-music-enabled'
const VOLUME_STORAGE_KEY = 'wishing-moon-music-volume'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [currentMusicType, setCurrentMusicType] = useState<CardType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) || '0.5')
    }
    return 0.5
  })
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const isPlayingRef = useRef(false)
  const currentMusicTypeRef = useRef<CardType | null>(null)
  const musicTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const useMiniMaxRef = useRef(false)

  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MUSIC_STORAGE_KEY)
      if (saved === 'true') {
        setIsVisible(true)
      }
      // Check MiniMax availability once
      useMiniMaxRef.current = isMiniMaxConfigured()
    }
  }, [])

  // Listen for card flip events to play card-specific music
  useEffect(() => {
    const handleCardFlip = (event: CustomEvent<{ cardId: number }>) => {
      playCardMusic(event.detail.cardId)
    }

    const handleCardMusic = (event: CustomEvent<{ cardId: number }>) => {
      playCardMusic(event.detail.cardId)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('tarotCardFlipped', handleCardFlip as EventListener)
      window.addEventListener('playCardMusic', handleCardMusic as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tarotCardFlipped', handleCardFlip as EventListener)
        window.removeEventListener('playCardMusic', handleCardMusic as EventListener)
      }
    }
  }, [])

  const stopMusic = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentMusicType(null)
    setGenerationError(null)

    // Stop MiniMax audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    // Stop Web Audio fallback
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    if (musicTimeoutRef.current) {
      clearTimeout(musicTimeoutRef.current)
      musicTimeoutRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const playCardMusic = useCallback(async (cardId: number) => {
    const cardType = getCardType(cardId)
    currentMusicTypeRef.current = cardType
    setCurrentMusicType(cardType)
    setGenerationError(null)

    // Stop any existing music
    stopMusic()

    isPlayingRef.current = true
    setIsPlaying(true)

    // Try MiniMax first
    if (useMiniMaxRef.current) {
      const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY
      if (apiKey) {
        setIsGenerating(true)
        try {
          const result = await generateMiniMaxMusic(cardType, apiKey)
          setIsGenerating(false)

          if (result.error) {
            setGenerationError(result.error)
            // Fallback to Web Audio
            playWebAudioFallback(cardType)
          } else if (result.url) {
            // Play MiniMax music
            playMiniMaxMusic(result.url)
            return
          }
        } catch (e) {
          setIsGenerating(false)
          console.warn('MiniMax error, falling back to Web Audio:', e)
          playWebAudioFallback(cardType)
        }
        return
      }
    }

    // Fallback to Web Audio
    playWebAudioFallback(cardType)
  }, [stopMusic])

  const playMiniMaxMusic = useCallback((url: string) => {
    try {
      const audio = new Audio(url)
      audioRef.current = audio

      audio.volume = volume * 0.6
      audio.play().catch(e => {
        console.warn('Audio playback failed:', e)
        // Fallback to Web Audio
        if (currentMusicTypeRef.current) {
          playWebAudioFallback(currentMusicTypeRef.current)
        }
      })

      audio.onended = () => {
        isPlayingRef.current = false
        setIsPlaying(false)
        setCurrentMusicType(null)
        audioRef.current = null
      }

      audio.onerror = () => {
        console.warn('MiniMax audio load failed, trying Web Audio fallback')
        if (currentMusicTypeRef.current) {
          playWebAudioFallback(currentMusicTypeRef.current)
        }
      }

      // Set timeout to stop after reasonable duration (2 minutes max for MiniMax)
      musicTimeoutRef.current = setTimeout(() => {
        stopMusic()
      }, 120000)
    } catch (e) {
      console.warn('MiniMax audio creation failed:', e)
      if (currentMusicTypeRef.current) {
        playWebAudioFallback(currentMusicTypeRef.current)
      }
    }
  }, [volume, stopMusic])

  const playWebAudioFallback = useCallback((cardType: CardType) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const style = LEGACY_MUSIC_STYLES[cardType as LegacyCardType]
      cleanupRef.current = createCardMusic(audioContextRef.current, cardType as LegacyCardType, volume * 0.3)

      // Auto-stop after music duration + fade
      musicTimeoutRef.current = setTimeout(() => {
        stopMusic()
      }, (style.tempo + 2) * 1000)
    } catch (e) {
      console.warn('Web Audio API not supported')
      stopMusic()
    }
  }, [volume, stopMusic])

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMusic()
      localStorage.setItem(MUSIC_STORAGE_KEY, 'false')
    } else {
      localStorage.setItem(MUSIC_STORAGE_KEY, 'true')
      if (!currentMusicTypeRef.current) {
        playCardMusic(0)
      }
    }
  }, [isPlaying, stopMusic, playCardMusic])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    localStorage.setItem(VOLUME_STORAGE_KEY, String(newVolume))
    
    // Update MiniMax audio volume
    if (audioRef.current) {
      audioRef.current.volume = newVolume * 0.6
    }
  }, [])

  // Show music player button after a short delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [stopMusic])

  const getMusicTypeDisplay = () => {
    if (isGenerating) return 'Generating music...'
    if (generationError) return 'Using fallback audio'
    if (!currentMusicType) return 'Tap a card to play music'
    return MUSIC_STYLES[currentMusicType].description
  }

  const getMusicTypeColor = () => {
    if (!currentMusicType) return '#FFFFFF'
    return MUSIC_STYLES[currentMusicType].color
  }

  return (
    <>
      {/* Music Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setShowControls(!showControls)}
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-yellow-400'
            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
        }`}
        title={isPlaying ? 'Music playing - Click for controls' : 'Turn on ambient music'}
        style={isPlaying && currentMusicType ? {
          borderColor: MUSIC_STYLES[currentMusicType].color + '50',
          boxShadow: `0 0 20px ${MUSIC_STYLES[currentMusicType].color}33`,
        } : undefined}
      >
        <Music size={20} className={isPlaying ? 'animate-pulse' : ''} style={isPlaying ? { color: getMusicTypeColor() } : undefined} />
      </motion.button>

      {/* Music Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-32 right-4 z-50 bg-black/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 w-60"
            style={isPlaying && currentMusicType ? {
              borderColor: MUSIC_STYLES[currentMusicType].color + '40',
              boxShadow: `0 0 30px ${MUSIC_STYLES[currentMusicType].color}22`,
            } : undefined}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'bg-white/30'}`}
                style={isPlaying && currentMusicType ? { backgroundColor: MUSIC_STYLES[currentMusicType].color } : undefined}
              />
              <span className="text-white text-sm font-medium">Tarot Music</span>
              {isGenerating && <Loader2 size={14} className="animate-spin text-yellow-400 ml-auto" />}
            </div>

            {/* Current music type */}
            {isPlaying && currentMusicType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 px-3 py-2 rounded-lg text-center text-xs"
                style={{
                  backgroundColor: `${MUSIC_STYLES[currentMusicType].color}15`,
                  border: `1px solid ${MUSIC_STYLES[currentMusicType].color}33`,
                  color: MUSIC_STYLES[currentMusicType].color,
                }}
              >
                {MUSIC_STYLES[currentMusicType].description}
                {isGenerating && ' (AI generating...)'}
                {generationError && ' (fallback mode)'}
              </motion.div>
            )}

            {/* Play hint */}
            {!isPlaying && (
              <div className="mb-3 px-3 py-2 rounded-lg text-center text-xs text-white/40">
                {getMusicTypeDisplay()}
              </div>
            )}

            {/* Play/Pause */}
            <button
              onClick={toggleMusic}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all mb-3"
              disabled={isGenerating}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="text-sm">{isPlaying ? 'Stop Music' : 'Play Demo'}</span>
            </button>

            {/* Volume Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-yellow-400
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Music style hints */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/30 text-xs text-center mb-2">Music plays automatically when you flip cards</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {(['major', 'wands', 'cups', 'swords', 'pentacles'] as CardType[]).map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: `${MUSIC_STYLES[type].color}15`,
                      color: MUSIC_STYLES[type].color,
                      opacity: currentMusicType === type ? 1 : 0.5,
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* MiniMax status */}
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/20 text-xs text-center">
                {useMiniMaxRef.current ? 'MiniMax AI: Enabled' : 'MiniMax AI: Not configured'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
