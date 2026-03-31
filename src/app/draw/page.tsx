'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Heart, RefreshCw, LogIn, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TarotCardFlip from '@/components/features/TarotCardFlip'
import { useAuth } from '@/contexts/AuthContext'
import type { TarotCard, MoonPhase } from '@/types'

interface DrawResult {
  card: TarotCard
  moonPhase: MoonPhase
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

  const handleDraw = useCallback(async () => {
    setIsDrawing(true)
    setShowResult(false)
    setError(null)
    setIsFavorited(false)

    try {
      const response = await fetch('/api/draw')
      if (!response.ok) throw new Error('Failed to draw card')
      const data: DrawResult = await response.json()
      setDrawnCard(data.card)
      setMoonPhase(data.moonPhase)
      setCardKey(k => k + 1) // Reset flip state
      setIsDrawing(false)
      setShowResult(true)

      // If logged in, save the draw
      if (user) {
        setSavingDraw(true)
        try {
          await fetch('/api/draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: data.card.id, category }),
          })
        } catch (e) {
          // Silent fail for draw saving
        }
        setSavingDraw(false)
      }
    } catch (err) {
      setError('Failed to draw card. Please try again.')
      setIsDrawing(false)
    }
  }, [user, category])

  const handleToggleFavorite = async () => {
    if (!drawnCard || !user) return
    setFavLoading(true)
    try {
      if (isFavorited) {
        await fetch(`/api/collections?cardId=${drawnCard.id}`, { method: 'DELETE' })
        setIsFavorited(false)
      } else {
        await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: drawnCard.id, isFavorite: true }),
        })
        setIsFavorited(true)
      }
    } catch (e) {
      // Silent fail
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
        {user && !showResult && (
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

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mb-4 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm"
          >
            {error}
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
            disabled={isDrawing}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDrawing ? 'Drawing...' : (user ? 'Draw Your Card' : 'Draw Your Card (Guest)')}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleDraw}
                disabled={isDrawing}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Draw Again
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
