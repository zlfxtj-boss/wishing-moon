'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react'

// Ambient music using Web Audio API - ethereal moon vibes
const createAmbientMusic = (audioContext: AudioContext): (() => void) => {
  const masterGain = audioContext.createGain()
  masterGain.gain.setValueAtTime(0.15, audioContext.currentTime)
  masterGain.connect(audioContext.destination)

  const createOscillator = (freq: number, type: OscillatorType, delay: number, gainValue: number) => {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    osc.type = type
    osc.frequency.setValueAtTime(freq, audioContext.currentTime)
    // Slow frequency drift for ambient feel
    osc.frequency.linearRampToValueAtTime(freq * 1.02, audioContext.currentTime + 8)
    osc.frequency.linearRampToValueAtTime(freq * 0.98, audioContext.currentTime + 16)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, audioContext.currentTime)
    filter.Q.setValueAtTime(1, audioContext.currentTime)

    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + delay)
    gain.gain.linearRampToValueAtTime(gainValue * 0.7, audioContext.currentTime + delay + 4)
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + 8)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(audioContext.currentTime + delay)
    osc.stop(audioContext.currentTime + delay + 10)

    return osc
  }

  // Create layered ambient tones (perfect fifths + octave for moon resonance)
  const notes = [130.81, 196.00, 261.63, 392.00, 523.25] // C3, G3, C4, G4, C5
  notes.forEach((freq, i) => {
    createOscillator(freq, 'sine', i * 2, 0.3 / (i + 1))
  })

  // Subtle pad
  const pad = audioContext.createOscillator()
  const padGain = audioContext.createGain()
  const padFilter = audioContext.createBiquadFilter()

  pad.type = 'sine'
  pad.frequency.setValueAtTime(65.41, audioContext.currentTime) // C2

  padFilter.type = 'lowpass'
  padFilter.frequency.setValueAtTime(300, audioContext.currentTime)

  padGain.gain.setValueAtTime(0, audioContext.currentTime)
  padGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 3)
  padGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 16)

  pad.connect(padFilter)
  padFilter.connect(padGain)
  padGain.connect(masterGain)

  pad.start(audioContext.currentTime)
  pad.stop(audioContext.currentTime + 18)

  // Return cleanup function
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
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) || '0.5')
    }
    return 0.5
  })
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const nextNoteTimeRef = useRef<number>(0)
  const cleanupRef = useRef<(() => void) | null>(null)
  const isPlayingRef = useRef(false)

  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MUSIC_STORAGE_KEY)
      if (saved === 'true') {
        setIsVisible(true)
      }
    }
  }, [])

  const startAmbientMusic = useCallback(() => {
    if (audioContextRef.current) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      isPlayingRef.current = true
      setIsPlaying(true)

      // Play ambient chord every 8 seconds
      const playChord = () => {
        if (!audioContextRef.current || !isPlayingRef.current) return
        cleanupRef.current = createAmbientMusic(audioContextRef.current)
      }

      // Initial chord
      playChord()
      // Repeat every 8 seconds
      const interval = setInterval(playChord, 8000)

      return () => {
        clearInterval(interval)
        if (cleanupRef.current) cleanupRef.current()
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
      }
    } catch (e) {
      console.warn('Web Audio API not supported')
      return () => {}
    }
  }, [])

  const stopAmbientMusic = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    if (cleanupRef.current) cleanupRef.current()
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopAmbientMusic()
      localStorage.setItem(MUSIC_STORAGE_KEY, 'false')
    } else {
      localStorage.setItem(MUSIC_STORAGE_KEY, 'true')
      startAmbientMusic()
    }
  }, [isPlaying, startAmbientMusic, stopAmbientMusic])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    localStorage.setItem(VOLUME_STORAGE_KEY, String(newVolume))
    // Volume will apply to next ambient chord
  }, [])

  // Show music player button after a short delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientMusic()
    }
  }, [stopAmbientMusic])

  if (!isVisible) return null

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
        title={isPlaying ? 'Music On - Click for controls' : 'Turn on ambient music'}
      >
        <Music size={20} className={isPlaying ? 'animate-pulse' : ''} />
      </motion.button>

      {/* Music Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-32 right-4 z-50 bg-black/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 w-56"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-yellow-400 animate-pulse' : 'bg-white/30'}`} />
              <span className="text-white text-sm font-medium">Ambient Music</span>
            </div>

            {/* Play/Pause */}
            <button
              onClick={toggleMusic}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all mb-3"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="text-sm">{isPlaying ? 'Pause Music' : 'Play Music'}</span>
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

            {/* Hint */}
            <p className="text-white/30 text-xs text-center mt-3">Ethereal moon vibes</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
