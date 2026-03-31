'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import { tarotCards } from '@/lib/tarot'

// Suit colors
const SUIT_CONFIG: Record<string, { primary: string; label: string }> = {
  major: { primary: '#C9A227', label: 'Major Arcana' },
  wands: { primary: '#E07B39', label: 'Wands' },
  cups: { primary: '#4A90D9', label: 'Cups' },
  swords: { primary: '#8E8EAF', label: 'Swords' },
  pentacles: { primary: '#27AE60', label: 'Pentacles' },
}

function getCardSuit(cardId: number) {
  if (cardId <= 21) return 'major'
  if (cardId <= 35) return 'wands'
  if (cardId <= 49) return 'cups'
  if (cardId <= 63) return 'swords'
  return 'pentacles'
}

export default function CardsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<typeof tarotCards[0] | null>(null)

  // Filter cards
  const filteredCards = tarotCards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.nameCn.includes(searchQuery)
    const matchesSuit = !selectedSuit || getCardSuit(card.id) === selectedSuit
    return matchesSearch && matchesSuit
  })

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(180deg, #0D0B1E 0%, #1A1235 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(13,11,30,0.9)', borderColor: '#1A1A3E' }}>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="p-2 rounded-full transition-colors" style={{ backgroundColor: '#1A1A3E' }}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">All 78 Cards</h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 outline-none"
              style={{ backgroundColor: '#1A1A3E' }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setSelectedSuit(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !selectedSuit ? 'text-black' : 'text-white/60'
              }`}
              style={{ 
                backgroundColor: !selectedSuit ? '#C9A227' : '#1A1A3E',
              }}
            >
              All
            </button>
            {Object.entries(SUIT_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedSuit(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSuit === key ? 'text-black' : 'text-white/60'
                }`}
                style={{ 
                  backgroundColor: selectedSuit === key ? config.primary : '#1A1A3E',
                }}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Cards grid */}
      <div className="px-4 py-4">
        <p className="text-white/40 text-xs mb-3">{filteredCards.length} cards</p>
        <div className="grid grid-cols-3 gap-3">
          {filteredCards.map((card) => {
            const suit = getCardSuit(card.id)
            const config = SUIT_CONFIG[suit]
            const imagePath = `/tarot-cards/tarot_${String(card.id).padStart(2, '0')}.jpg`

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: card.id * 0.01 }}
                onClick={() => setSelectedCard(card)}
                className="relative aspect-[2/3] rounded-xl overflow-hidden group"
                style={{ boxShadow: `0 4px 20px ${config.primary}33` }}
              >
                {/* Card image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${imagePath}')` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Card number */}
                <div 
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: config.primary, color: '#0D0B1E' }}
                >
                  {card.id}
                </div>
                
                {/* Card name */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="text-white text-xs font-medium truncate">{card.name}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('/tarot-cards/tarot_${String(selectedCard.id).padStart(2, '0')}.jpg')` 
              }}
            />
            
            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4" style={{
              background: 'linear-gradient(to top, rgba(13,11,30,0.95) 0%, transparent 100%)'
            }}>
              <h2 className="text-xl font-bold" style={{ color: SUIT_CONFIG[getCardSuit(selectedCard.id)].primary }}>
                {selectedCard.name}
              </h2>
              <p className="text-white/70 text-sm">{selectedCard.nameCn}</p>
              
              {/* Keywords */}
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCard.keywords.slice(0, 4).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${SUIT_CONFIG[getCardSuit(selectedCard.id)].primary}33`,
                      color: SUIT_CONFIG[getCardSuit(selectedCard.id)].primary,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
