'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Heart, RefreshCw, LogIn, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TarotCardFlip from '@/components/features/TarotCardFlip'
import { useAuth } from '@/contexts/AuthContext'
import { addToFavorites, removeFromFavorites, isCardFavorited } from '@/lib/collections'
import { useTheme } from '@/lib/theme'
import type { TarotCard, MoonPhase } from '@/types'

interface DrawResult {
  card: TarotCard
  moonPhase: MoonPhase
}

interface DrawCountInfo {
  remainingDraws: number
  maxDraws: number
  totalDrawsToday: number
  limitReached: boolean
}

export default function DrawPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { theme } = useTheme()
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null)
  const [moonPhase, setMoonPhase] = useState<DrawResult['moonPhase'] | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [category, setCategory] = useState<'love' | 'career' | 'health' | 'spirituality'>('love')
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [savingDraw, setSavingDraw] = useState(false)
  const [cardKey, setCardKey] = useState(0) // Force remount on new draw to reset flip state
  const [drawCountInfo, setDrawCountInfo] = useState<DrawCountInfo>({
    remainingDraws: 3,
    maxDraws: 3,
    totalDrawsToday: 0,
    limitReached: false,
  })
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  // Fetch remaining draw count
  const fetchDrawCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/draw')
      if (res.ok) {
        const data = await res.json()
        setDrawCountInfo(data)
      }
    } catch (e) {
      // Silent fail
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDrawCount()
    }
  }, [user, fetchDrawCount])

  const handleDraw = useCallback(async () => {
    // Check if limit reached (for logged-in users)
    if (user && drawCountInfo.limitReached) {
      setLimitMessage('今日抽牌次数已用完，请明天再来')
      return
    }

    setIsDrawing(true)
    setShowResult(false)
    setError(null)
    setIsFavorited(false)
    setLimitMessage(null)

    try {
      // First, get a random card
      const response = await fetch('/api/draw')
      if (!response.ok) throw new Error('Failed to draw card')
      const data: DrawResult = await response.json()
      
      // Update moon phase
      setMoonPhase(data.moonPhase)
      setCardKey(k => k + 1) // Reset flip state
      setDrawnCard(data.card)
      setIsDrawing(false)
      setShowResult(true)

      // If logged in, check if already favorited and save the draw
      if (user) {
        // Check if already favorited
        try {
          const favorited = await isCardFavorited(data.card.id)
          setIsFavorited(favorited)
        } catch (e) {
          // Ignore
        }
        
        // Save the draw
        setSavingDraw(true)
        try {
          const saveRes = await fetch('/api/draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: data.card.id, category }),
          })
          
          if (saveRes.status === 429) {
            // Limit reached
            const limitData = await saveRes.json()
            setLimitMessage('今日抽牌次数已用完，请明天再来')
            setDrawCountInfo(prev => ({ ...prev, limitReached: true, remainingDraws: 0 }))
          } else if (saveRes.ok) {
            // Refresh draw count
            fetchDrawCount()
          }
        } catch (e) {
          // Silent fail for draw saving
        }
        setSavingDraw(false)
      }
    } catch (err) {
      setError('Failed to draw card. Please try again.')
      setIsDrawing(false)
    }
  }, [user, category, drawCountInfo.limitReached, fetchDrawCount])

  const handleToggleFavorite = async () => {
    if (!drawnCard || !user) return
    setFavLoading(true)
    setError(null)
    try {
      if (isFavorited) {
        await removeFromFavorites(drawnCard.id)
        setIsFavorited(false)
      } else {
        await addToFavorites(drawnCard.id)
        setIsFavorited(true)
        window.location.reload()
      }
    } catch (e: any) {
      setError('Save failed: ' + e.message)
    }
    setFavLoading(false)
  }

  const handleShare = () => {
    if (!drawnCard) return
    const text = `${drawnCard.shareText}\n\n${drawnCard.shareHashtags}`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  const handleAuth = async () => {
    if (user) {
      await signOut()
    } else {
      window.location.href = '/login'
    }
  }

  // Get the reading text based on selected category
  const getReading = () => {
    if (!drawnCard) return ''
    switch (category) {
      case 'love': return drawnCard.love
      case 'career': return drawnCard.career
      case 'health': return drawnCard.health
      case 'spirituality': return drawnCard.spirituality
      default: return drawnCard.meaning
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-start justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Daily Draw</h1>
          <p className="text-white/60 text-sm mt-1">
            {moonPhase ? `${moonPhase.emoji} ${moonPhase.name}` : 'Receive your card of the day'}
          </p>
          {/* Remaining draws indicator for logged-in users */}
          {user && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-yellow-400/80 text-xs font-decorative">今日剩余:</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < drawCountInfo.remainingDraws
                        ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/40 text-xs">
                {drawCountInfo.remainingDraws}/{drawCountInfo.maxDraws}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleAuth}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-sm"
        >
          {user ? (
            <>
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </>
          )}
        </button>
      </header>

      {/* Auth hint */}
      <AnimatePresence>
        {!authLoading && !user && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs"
          >
            <Link href="/login" className="underline">Sign in</Link> to save your draws and build your collection
          </motion.div>
        )}
        {user && !showResult && !limitMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs"
          >
            Drawing saved! Your readings are being recorded.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Limit Message */}
      <AnimatePresence>
        {(error || limitMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mx-6 mb-4 px-4 py-3 border rounded-xl text-sm ${
              limitMessage 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            {limitMessage || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Area */}
      <section className="px-6 mb-8">
        <div className="aspect-[2/3] max-w-xs mx-auto relative">
          <AnimatePresence mode="wait">
            {isDrawing && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full bg-gradient-to-br from-purple-900/80 to-indigo-900/80 rounded-2xl border border-yellow-400/30 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-12 h-12 text-yellow-400" />
                  </motion.div>
                  <p className="text-yellow-400/80 text-sm font-decorative tracking-wider">
                    Receiving...
                  </p>
                </div>
              </motion.div>
            )}
            {!isDrawing && !showResult && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  // Theme-aware CSS variables
                  '--glow-primary': theme === 'cyberpunk'
                    ? 'rgba(0, 255, 255, 0.7)'
                    : 'rgba(212, 160, 23, 0.8)',
                  '--glow-secondary': theme === 'cyberpunk'
                    ? 'rgba(255, 0, 255, 0.4)'
                    : 'rgba(180, 120, 20, 0.5)',
                  '--border-glow': theme === 'cyberpunk'
                    ? 'rgba(0, 255, 255, 0.5)'
                    : 'rgba(201, 162, 39, 0.6)',
                  '--card-bg': theme === 'cyberpunk'
                    ? 'rgba(10, 10, 30, 0.85)'
                    : 'rgba(30, 20, 10, 0.90)',
                } as React.CSSProperties}
              >
                {/* === Animated Starfield Background === */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: theme === 'cyberpunk'
                      ? `radial-gradient(ellipse at 15% 20%, rgba(120,0,255,0.25) 0%, transparent 45%),
                         radial-gradient(ellipse at 85% 80%, rgba(0,200,255,0.15) 0%, transparent 45%),
                         radial-gradient(ellipse at 50% 50%, rgba(60,0,120,0.3) 0%, transparent 65%),
                         linear-gradient(160deg, #080818 0%, #0d0820 40%, #100828 100%)`
                      : `radial-gradient(ellipse at 20% 25%, rgba(150,80,10,0.3) 0%, transparent 45%),
                         radial-gradient(ellipse at 80% 75%, rgba(100,50,5,0.25) 0%, transparent 45%),
                         radial-gradient(ellipse at 50% 50%, rgba(80,40,5,0.2) 0%, transparent 65%),
                         linear-gradient(160deg, #1a0f05 0%, #251508 40%, #1a0c04 100%)`,
                  }}
                />

                {/* === Starfield Dots (static positions, twinkling via animation) === */}
                <div className="absolute inset-0" style={{
                  backgroundImage: theme === 'cyberpunk'
                    ? `radial-gradient(1.5px 1.5px at 12% 18%, rgba(200,220,255,0.9) 0%, transparent 100%),
                       radial-gradient(1px 1px at 27% 55%, rgba(180,200,255,0.7) 0%, transparent 100%),
                       radial-gradient(2px 2px at 45% 8%, rgba(150,180,255,0.8) 0%, transparent 100%),
                       radial-gradient(1px 1px at 60% 35%, rgba(200,220,255,0.6) 0%, transparent 100%),
                       radial-gradient(1.5px 1.5px at 78% 12%, rgba(180,200,255,0.9) 0%, transparent 100%),
                       radial-gradient(1px 1px at 88% 60%, rgba(160,200,255,0.5) 0%, transparent 100%),
                       radial-gradient(2px 2px at 92% 85%, rgba(200,220,255,0.7) 0%, transparent 100%),
                       radial-gradient(1px 1px at 35% 92%, rgba(180,200,255,0.6) 0%, transparent 100%),
                       radial-gradient(1.5px 1.5px at 55% 75%, rgba(200,220,255,0.8) 0%, transparent 100%),
                       radial-gradient(1px 1px at 8% 78%, rgba(160,200,255,0.5) 0%, transparent 100%)`
                    : `radial-gradient(1.5px 1.5px at 15% 22%, rgba(255,220,150,0.85) 0%, transparent 100%),
                       radial-gradient(1px 1px at 32% 58%, rgba(255,210,130,0.65) 0%, transparent 100%),
                       radial-gradient(2px 2px at 48% 10%, rgba(255,225,140,0.8) 0%, transparent 100%),
                       radial-gradient(1px 1px at 63% 38%, rgba(255,215,130,0.6) 0%, transparent 100%),
                       radial-gradient(1.5px 1.5px at 80% 15%, rgba(255,220,145,0.9) 0%, transparent 100%),
                       radial-gradient(1px 1px at 90% 65%, rgba(255,210,130,0.5) 0%, transparent 100%),
                       radial-gradient(2px 2px at 85% 88%, rgba(255,225,140,0.75) 0%, transparent 100%),
                       radial-gradient(1px 1px at 38% 95%, rgba(255,215,130,0.6) 0%, transparent 100%),
                       radial-gradient(1.5px 1.5px at 58% 78%, rgba(255,220,145,0.8) 0%, transparent 100%),
                       radial-gradient(1px 1px at 10% 80%, rgba(255,210,130,0.55) 0%, transparent 100%)`,
                  animation: 'starTwinkle 3s ease-in-out infinite alternate',
                }} />

                {/* === Rotating Light Rays === */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%,
                      transparent 0deg,
                      rgba(255,215,0,0.06) 20deg,
                      transparent 50deg,
                      rgba(255,215,0,0.04) 100deg,
                      transparent 140deg,
                      rgba(255,215,0,0.05) 180deg,
                      transparent 220deg,
                      rgba(255,215,0,0.06) 260deg,
                      transparent 300deg,
                      rgba(255,215,0,0.04) 340deg,
                      transparent 360deg)`,
                    animation: 'raysRotate 25s linear infinite',
                  }}
                />

                {/* === Glowing Border === */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                  style={{
                    border: theme === 'cyberpunk'
                      ? '1.5px solid rgba(0,255,255,0.4)'
                      : '2px solid rgba(201,162,39,0.55)',
                    boxShadow: theme === 'cyberpunk'
                      ? `inset 0 0 20px rgba(0,255,255,0.08), inset 0 0 40px rgba(255,0,255,0.05), 0 0 15px rgba(0,255,255,0.2), 0 0 30px rgba(0,255,255,0.1)`
                      : `inset 0 0 15px rgba(201,162,39,0.15), inset 0 0 30px rgba(180,120,20,0.1), 0 0 12px rgba(201,162,39,0.25), 0 0 25px rgba(180,120,20,0.12)`,
                    animation: 'borderPulse 4s ease-in-out infinite',
                  }}
                />

                {/* === Corner Flourishes === */}
                {[
                  { top: 8, left: 8, rotate: '0deg' },
                  { top: 8, right: 8, rotate: '90deg' },
                  { bottom: 8, left: 8, rotate: '-90deg' },
                  { bottom: 8, right: 8, rotate: '180deg' },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute z-10 pointer-events-none"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      right: pos.right,
                      bottom: pos.bottom,
                      width: 32,
                      height: 32,
                      transform: `rotate(${pos.rotate})`,
                    }}
                  >
                    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" style={{
                      filter: theme === 'cyberpunk'
                        ? 'drop-shadow(0 0 4px rgba(0,255,255,0.7))'
                        : 'drop-shadow(0 0 4px rgba(201,162,39,0.8))',
                      animation: `cornerGlow 3s ease-in-out ${i * 0.5}s infinite alternate`,
                    }}>
                      {theme === 'cyberpunk' ? (
                        // Cyberpunk corner: sharp geometric
                        <path
                          d="M2 16 L2 2 L16 2 M2 2 L8 2 L2 8"
                          stroke={theme === 'cyberpunk' ? 'rgba(0,255,255,0.9)' : 'rgba(201,162,39,0.9)'}
                          strokeWidth="1.5"
                          fill="none"
                        />
                      ) : (
                        // Oil Painting corner: ornate scroll
                        <>
                          <path
                            d="M2 16 Q2 2 16 2"
                            stroke="rgba(201,162,39,0.85)"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M2 12 Q2 6 8 2"
                            stroke="rgba(180,140,30,0.7)"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <circle cx="16" cy="2" r="1.5" fill="rgba(201,162,39,0.9)" />
                          <circle cx="2" cy="16" r="1" fill="rgba(180,140,30,0.7)" />
                        </>
                      )}
                    </svg>
                  </div>
                ))}

                {/* === Central Moon with Mystic Circle === */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Outer mystic ring */}
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 140,
                        height: 140,
                        border: theme === 'cyberpunk'
                          ? '1px solid rgba(0,255,255,0.25)'
                          : '1px solid rgba(201,162,39,0.3)',
                        boxShadow: theme === 'cyberpunk'
                          ? `0 0 15px rgba(0,255,255,0.15), inset 0 0 15px rgba(0,255,255,0.08)`
                          : `0 0 12px rgba(201,162,39,0.2), inset 0 0 12px rgba(180,120,20,0.1)`,
                        animation: 'ringRotate 12s linear infinite',
                      }}
                    />
                    {/* Dashed inner ring */}
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 120,
                        height: 120,
                        border: theme === 'cyberpunk'
                          ? '1px dashed rgba(0,255,255,0.15)'
                          : '1px dashed rgba(201,162,39,0.2)',
                        animation: 'ringRotate 8s linear infinite reverse',
                      }}
                    />

                    {/* Glow halo behind moon */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 80,
                        height: 80,
                        background: theme === 'cyberpunk'
                          ? `radial-gradient(circle, rgba(0,255,255,0.25) 0%, rgba(120,0,255,0.15) 40%, transparent 70%)`
                          : `radial-gradient(circle, rgba(212,160,23,0.3) 0%, rgba(180,100,20,0.15) 40%, transparent 70%)`,
                        filter: 'blur(8px)',
                        animation: 'haloPulse 3s ease-in-out infinite',
                      }}
                    />

                    {/* Moon symbol */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative z-10"
                      style={{
                        fontSize: '3.8rem',
                        lineHeight: 1,
                        filter: theme === 'cyberpunk'
                          ? 'drop-shadow(0 0 12px rgba(0,255,255,0.8))'
                          : 'drop-shadow(0 0 10px rgba(212,160,23,0.9))',
                      }}
                    >
                      ☽
                    </motion.div>

                    {/* Orbiting symbols (positioned around the ring) */}
                    {[
                      { angle: 0, symbol: '☆', delay: '0s' },
                      { angle: 90, symbol: '✧', delay: '1s' },
                      { angle: 180, symbol: '⚝', delay: '2s' },
                      { angle: 270, symbol: '✦', delay: '3s' },
                    ].map(({ angle, symbol, delay }) => {
                      const rad = (angle * Math.PI) / 180
                      const x = Math.cos(rad) * 70
                      const y = Math.sin(rad) * 70
                      return (
                        <div
                          key={angle}
                          className="absolute pointer-events-none"
                          style={{
                            transform: `translate(${x - 8}px, ${y - 8}px)`,
                            fontSize: '0.75rem',
                            color: theme === 'cyberpunk'
                              ? 'rgba(0,255,255,0.7)'
                              : 'rgba(201,162,39,0.8)',
                            animation: `starOrbit 4s linear ${delay} infinite`,
                            textShadow: theme === 'cyberpunk'
                              ? '0 0 6px rgba(0,255,255,0.8)'
                              : '0 0 6px rgba(201,162,39,0.8)',
                          }}
                        >
                          {symbol}
                        </div>
                      )
                    })}
                  </motion.div>
                </div>

                {/* === Mystic Symbols scattered around === */}
                {/* Top center symbol */}
                <div
                  className="absolute top-[18%] left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  style={{
                    fontSize: '0.9rem',
                    color: theme === 'cyberpunk'
                      ? 'rgba(0,255,255,0.5)'
                      : 'rgba(201,162,39,0.6)',
                    animation: 'symbolFloat 5s ease-in-out infinite',
                    textShadow: theme === 'cyberpunk'
                      ? '0 0 8px rgba(0,255,255,0.6)'
                      : '0 0 8px rgba(201,162,39,0.6)',
                  }}
                >
                  ◈
                </div>
                {/* Bottom center symbol */}
                <div
                  className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  style={{
                    fontSize: '0.8rem',
                    color: theme === 'cyberpunk'
                      ? 'rgba(255,0,255,0.45)'
                      : 'rgba(180,120,20,0.55)',
                    animation: 'symbolFloat 5s ease-in-out 1.5s infinite',
                    textShadow: theme === 'cyberpunk'
                      ? '0 0 8px rgba(255,0,255,0.5)'
                      : '0 0 8px rgba(180,120,20,0.5)',
                  }}
                >
                  ◇
                </div>
                {/* Left symbol */}
                <div
                  className="absolute left-[15%] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{
                    fontSize: '0.7rem',
                    color: theme === 'cyberpunk'
                      ? 'rgba(0,200,255,0.4)'
                      : 'rgba(201,162,39,0.45)',
                    animation: 'symbolFloat 6s ease-in-out 0.8s infinite',
                    textShadow: theme === 'cyberpunk'
                      ? '0 0 6px rgba(0,200,255,0.5)'
                      : '0 0 6px rgba(201,162,39,0.5)',
                  }}
                >
                  ⚝
                </div>
                {/* Right symbol */}
                <div
                  className="absolute right-[15%] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{
                    fontSize: '0.7rem',
                    color: theme === 'cyberpunk'
                      ? 'rgba(180,0,255,0.4)'
                      : 'rgba(180,140,30,0.45)',
                    animation: 'symbolFloat 6s ease-in-out 2.2s infinite',
                    textShadow: theme === 'cyberpunk'
                      ? '0 0 6px rgba(180,0,255,0.5)'
                      : '0 0 6px rgba(180,140,30,0.5)',
                  }}
                >
                  ✧
                </div>

                {/* === Bottom Text === */}
                <div className="absolute bottom-6 inset-x-0 z-10 text-center">
                  <p
                    className="font-decorative tracking-widest text-sm"
                    style={{
                      color: theme === 'cyberpunk'
                        ? 'rgba(0,255,255,0.65)'
                        : 'rgba(201,162,39,0.75)',
                      textShadow: theme === 'cyberpunk'
                        ? '0 0 10px rgba(0,255,255,0.4)'
                        : '0 0 10px rgba(201,162,39,0.4)',
                      animation: 'textBreath 3s ease-in-out infinite',
                    }}
                  >
                    点击下方领取你的命运之牌
                  </p>
                </div>
              </motion.div>
            )}
            {showResult && drawnCard && (
              <motion.div
                key={`card-${cardKey}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full"
              >
                <TarotCardFlip
                  card={drawnCard}
                  moonPhase={moonPhase?.name}
                  category={category}
                  showReading={showResult}
                  onFlip={() => {
                    // Trigger music on flip
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('playCardMusic', { detail: { cardId: drawnCard.id } })
                      window.dispatchEvent(event)
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Category Selector */}
      {showResult && (
        <section className="px-6 mb-6">
          <div className="flex gap-2 justify-center flex-wrap">
            {(['love', 'career', 'health', 'spirituality'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <section className="px-6">
        {!showResult ? (
          <button
            onClick={handleDraw}
            disabled={isDrawing || !!(user && drawCountInfo.limitReached)}
            className={`w-full py-4 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              user && drawCountInfo.limitReached
                ? 'bg-white/10 text-white/40 border border-white/10'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black'
            }`}
          >
            {isDrawing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Drawing...
              </span>
            ) : user && drawCountInfo.limitReached ? (
              '今日抽牌次数已用完'
            ) : user ? (
              `Draw Your Card (${drawCountInfo.remainingDraws} left)`
            ) : (
              'Draw Your Card (Guest)'
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleDraw}
                disabled={isDrawing || !!(user && drawCountInfo.limitReached)}
                className={`flex-1 py-3.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  user && drawCountInfo.limitReached
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <RefreshCw size={16} />
                {user && drawCountInfo.limitReached ? '明日再来' : 'Draw Again'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
            {/* Favorite Button */}
            {user && drawnCard && (
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isFavorited
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-white/10 hover:bg-white/20 text-white/60 border border-white/10'
                }`}
              >
                <Heart size={16} className={isFavorited ? 'fill-red-400' : ''} />
                {isFavorited ? 'Saved to Collection' : 'Save to Collection'}
              </button>
            )}
            {!user && drawnCard && (
              <Link
                href="/login"
                className="block w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-center text-sm transition-all"
              >
                Sign in to save cards to your collection
              </Link>
            )}
          </div>
        )}
      </section>

      <Navbar />
    </main>
  )
}
