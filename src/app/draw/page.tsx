'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Heart, RefreshCw, LogIn, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TarotCardFlip from '@/components/features/TarotCardFlip'
import { useAuth } from '@/contexts/AuthContext'
import { addToFavorites, removeFromFavorites, isCardFavorited } from '@/lib/collections'
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl border border-white/10 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl mb-4"
                  >
                    ☽
                  </motion.div>
                  <p className="text-white/30 text-sm font-decorative tracking-wide">
                    Tap below to receive your card
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
