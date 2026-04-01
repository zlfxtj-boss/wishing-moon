'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Heart, Clock, LogIn, X } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { tarotCards, getTarotCardById } from '@/lib/tarot'
import { getCollections, removeFromFavorites } from '@/lib/collections'
import type { TarotCard } from '@/types'

type ViewTab = 'all' | 'favorites' | 'history'

interface CollectionItem {
  id: number
  card_id: number
  is_favorite: boolean
  collected_at: string
  card_data?: TarotCard
}

interface HistoryItem {
  id: number
  card_id: number
  draw_date: string
  category: string
  created_at: string
  card_data?: TarotCard
}

export default function CollectionPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArcana, setSelectedArcana] = useState<'all' | 'major' | 'minor'>('all')
  const [tab, setTab] = useState<ViewTab>('all')
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [unfavoriting, setUnfavoriting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const data = await getCollections()
      // Enrich with card data
      const enrichedCollections = (data.collections || []).map((col) => ({
        ...col,
        card_data: getTarotCardById(col.card_id),
      }))
      const enrichedHistory = (data.history || []).map((h) => ({
        ...h,
        card_data: getTarotCardById(h.card_id),
      }))
      setCollections(enrichedCollections)
      setHistory(enrichedHistory)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  const handleUnfavorite = async (cardId: number) => {
    setUnfavoriting(cardId)
    try {
      await removeFromFavorites(cardId)
      setCollections(prev => prev.filter(c => c.card_id !== cardId))
    } catch (e) {
      // Silent fail
    }
    setUnfavoriting(null)
  }

  // Filter cards based on search and arcana
  const filteredAllCards = tarotCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.nameCn.includes(searchQuery)
    const matchesArcana =
      selectedArcana === 'all' ||
      (selectedArcana === 'major' && card.id <= 21) ||
      (selectedArcana === 'minor' && card.id > 21)
    return matchesSearch && matchesArcana
  })

  const favoriteIds = new Set(collections.map(c => c.card_id))
  const drawnIds = new Set(history.map(h => h.card_id))

  const favoriteCards = collections
    .map(c => c.card_data)
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = collections.find(c => c.card_id === a!.id)?.collected_at || ''
      const bTime = collections.find(c => c.card_id === b!.id)?.collected_at || ''
      return bTime.localeCompare(aTime)
    }) as TarotCard[]

  const historyCards = history
    .map(h => ({ ...h, card: h.card_data }))
    .filter(h => h.card)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Collection</h1>
        <p className="text-white/60 text-sm mt-1">
          {user ? `${tarotCards.length} cards in deck` : `${tarotCards.length} cards available`}
        </p>
      </header>

      {/* Tabs (only show if logged in) */}
      {user && (
        <section className="px-6 mb-4">
          <div className="flex gap-2 bg-white/5 rounded-xl p-1">
            {([
              { key: 'all', label: 'All Cards', icon: null, count: 0 },
              { key: 'favorites', label: 'Favorites', icon: Heart, count: favoriteIds.size },
              { key: 'history', label: 'History', icon: Clock, count: drawnIds.size },
            ] as const).map(({ key, label, icon: Icon, count }: any) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  tab === key
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {Icon && <Icon size={14} className={tab === key ? '' : ''} />}
                {label}
                {count > 0 && (
                  <span className={`text-xs ${tab === key ? 'text-black/60' : 'text-white/40'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <section className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </section>

      {/* Filters (only show in "all" tab) */}
      {tab === 'all' && (
        <section className="px-6 mb-6">
          <div className="flex gap-2">
            {(['all', 'major', 'minor'] as const).map((arc) => (
              <button
                key={arc}
                onClick={() => setSelectedArcana(arc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedArcana === arc
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {arc.charAt(0).toUpperCase() + arc.slice(1)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="px-6">
        {/* All Cards View */}
        {tab === 'all' && (
          <div className="grid grid-cols-3 gap-3">
            {filteredAllCards.map((card, index) => {
              const imagePath = `/tarot-cards/tarot_${String(card.id).padStart(2, '0')}.jpg`
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.01, 0.3) }}
                  className="aspect-[2/3] rounded-xl border border-white/10 p-0.5 flex flex-col relative overflow-hidden"
                >
                  {/* Favorite indicator */}
                  {favoriteIds.has(card.id) && (
                    <Heart size={14} className="absolute top-1.5 right-1.5 text-red-400 fill-red-400 z-10" />
                  )}
                  {/* Card image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${imagePath}')` }}
                  />
                  {/* Gradient overlay for text */}
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(13,11,30,0.95) 0%, rgba(13,11,30,0.4) 40%, transparent 100%)' }}
                  />
                  {/* Card number badge */}
                  <div 
                    className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#C9A227', color: '#0D0B1E' }}
                  >
                    {card.id}
                  </div>
                  {/* Card name */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className="text-white text-xs font-medium truncate">{card.name}</p>
                    <p className="text-yellow-400/70 text-xs">{card.nameCn}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Favorites View */}
        {tab === 'favorites' && (
          <>
            {!user ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-4">Sign in to see your favorited cards</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              </div>
            ) : loadingData ? (
              <div className="text-center py-12">
                <p className="text-white/40">Loading...</p>
              </div>
            ) : favoriteCards.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No favorites yet</p>
                <p className="text-white/40 text-sm">Draw cards and tap the heart to save them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {favoriteCards.map((card) => {
                  const imagePath = `/tarot-cards/tarot_${String(card.id).padStart(2, '0')}.jpg`
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-[2/3] rounded-xl border border-red-500/30 p-0.5 flex flex-col relative overflow-hidden"
                    >
                      <button
                        onClick={() => handleUnfavorite(card.id)}
                        disabled={unfavoriting === card.id}
                        className="absolute top-1.5 right-1.5 text-red-400 hover:text-red-300 transition-colors z-10"
                      >
                        <X size={16} />
                      </button>
                      {/* Card image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${imagePath}')` }}
                      />
                      {/* Gradient overlay */}
                      <div 
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(13,11,30,0.95) 0%, rgba(13,11,30,0.4) 40%, transparent 100%)' }}
                      />
                      {/* Card number badge */}
                      <div 
                        className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#C9A227', color: '#0D0B1E' }}
                      >
                        {card.id}
                      </div>
                      {/* Card name */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <p className="text-white text-xs font-medium truncate">{card.name}</p>
                        <p className="text-yellow-400/70 text-xs">{card.nameCn}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* History View */}
        {tab === 'history' && (
          <>
            {!user ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-4">Sign in to see your draw history</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              </div>
            ) : loadingData ? (
              <div className="text-center py-12">
                <p className="text-white/40">Loading...</p>
              </div>
            ) : historyCards.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No draws yet</p>
                <p className="text-white/40 text-sm">Your draw history will appear here</p>
                <Link
                  href="/draw"
                  className="inline-block mt-4 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl"
                >
                  Draw Your First Card
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {historyCards.map((item) => {
                  const imagePath = `/tarot-cards/tarot_${String(item.card!.id).padStart(2, '0')}.jpg`
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div 
                        className="w-14 h-20 bg-cover bg-center rounded-lg border border-white/10 flex-shrink-0"
                        style={{ backgroundImage: `url('${imagePath}')` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.card!.name}</p>
                        <p className="text-yellow-400/70 text-sm">{item.card!.nameCn}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/40 text-xs">
                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="px-2 py-0.5 bg-white/10 rounded-full text-white/50 text-xs capitalize">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Navbar />
    </main>
  )
}
