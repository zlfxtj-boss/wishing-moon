'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TarotCard } from '@/types'

// Suit colors for different card types
const SUIT_CONFIG: Record<string, { primary: string; secondary: string; glow: string; symbol: string }> = {
  major: { primary: '#C9A227', secondary: '#7B2FBE', glow: '#C9A227', symbol: '✦' },
  wands: { primary: '#E07B39', secondary: '#8B4513', glow: '#FF9F43', symbol: '⚡' },
  cups: { primary: '#4A90D9', secondary: '#1E3A5F', glow: '#54A0FF', symbol: '❋' },
  swords: { primary: '#8E8EAF', secondary: '#2D2D4E', glow: '#C0C0E0', symbol: '⬡' },
  pentacles: { primary: '#27AE60', secondary: '#1A4D2E', glow: '#2ECC71', symbol: '⬢' },
}

function getCardConfig(cardId: number) {
  if (cardId <= 21) return SUIT_CONFIG.major
  if (cardId <= 35) return SUIT_CONFIG.wands
  if (cardId <= 49) return SUIT_CONFIG.cups
  if (cardId <= 63) return SUIT_CONFIG.swords
  return SUIT_CONFIG.pentacles
}

// SVG decorative corner ornament
function CornerOrnament({ color, rotation }: { color: string; rotation: number }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{
        position: 'absolute',
        transform: `rotate(${rotation}deg)`,
        opacity: 0.7,
      }}
    >
      <path
        d="M2 2 Q2 16 16 16 Q2 16 2 30"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2" fill={color} />
    </svg>
  )
}

// Card front with REAL IMAGE
function CardFrontArt({ card, config }: { card: TarotCard; config: ReturnType<typeof getCardConfig> }) {
  const isMajor = card.id <= 21
  const cardNum = card.id
  
  // Image path for real tarot card image
  const imagePath = `/tarot-cards/tarot_${String(card.id).padStart(2, '0')}.jpg`

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* REAL TAROT CARD IMAGE as background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${imagePath}')`,
        }}
      />
      
      {/* Dark gradient overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(13,11,30,0.9) 0%, rgba(13,11,30,0.4) 40%, rgba(13,11,30,0.2) 100%)',
        }}
      />
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      />

      {/* Card number badge */}
      <div
        className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-decorative font-bold text-xs"
        style={{
          backgroundColor: `${config.primary}DD`,
          border: `2px solid ${config.primary}`,
          color: '#0D0B1E',
          boxShadow: `0 0 15px ${config.glow}`,
        }}
      >
        {cardNum}
      </div>

      {/* Arcana label */}
      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-decorative tracking-wider uppercase"
        style={{
          backgroundColor: `${config.primary}DD`,
          border: `1px solid ${config.primary}`,
          color: '#0D0B1E',
        }}
      >
        {isMajor ? 'Major' : 'Minor'}
      </div>

      {/* Card name - bottom area */}
      <div className="absolute bottom-0 left-0 right-0 p-4" style={{
        background: 'linear-gradient(to top, rgba(13,11,30,0.95) 0%, rgba(13,11,30,0.6) 60%, transparent 100%)',
      }}>
        <h2 className="font-decorative text-lg font-bold text-center leading-tight" style={{ color: config.primary }}>
          {card.name}
        </h2>
        <p className="font-decorative text-xs text-center mt-0.5" style={{ color: `${config.primary}BB` }}>
          {card.nameCn}
        </p>
      </div>

      {/* Golden border overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `2px solid ${config.primary}66`,
          boxShadow: `inset 0 0 30px ${config.glow}22`,
        }}
      />
    </div>
  )
}

interface TarotCardFlipProps {
  card: TarotCard
  moonPhase?: string
  category: 'love' | 'career' | 'health' | 'spirituality'
  showReading: boolean
}

export default function TarotCardFlip({ card, moonPhase, category, showReading }: TarotCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const config = getCardConfig(card.id)

  // Get reading text based on category
  const readingMap: Record<string, string> = {
    love: card.love,
    career: card.career,
    health: card.health,
    spirituality: card.spirituality,
  }
  const reading = readingMap[category] || card.meaning

  const handleFlip = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="w-full h-full" style={{ perspective: '1200px' }}>
      <motion.div
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d', cursor: 'pointer' }}
        className="relative w-full h-full"
      >
        {/* ===== FRONT FACE ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <CardFrontArt card={card} config={config} />

          {/* Click hint overlay */}
          {!hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: `1px solid ${config.primary}`,
                  color: config.primary,
                }}
              >
                Tap to reveal your reading
              </motion.div>
            </motion.div>
          )}

          {/* Corner ornaments */}
          <CornerOrnament color={config.primary} rotation={0} />
          <CornerOrnament color={config.primary} rotation={90} />
          <CornerOrnament color={config.primary} rotation={180} />
          <CornerOrnament color={config.primary} rotation={270} />
        </div>

        {/* ===== BACK FACE ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back background */}
          <div
            className="relative w-full h-full p-4 flex flex-col"
            style={{
              background: `linear-gradient(160deg, #1A1235 0%, #0D0B1E 50%, #1A0F2E 100%)`,
            }}
          >
            {/* Decorative top border */}
            <div
              className="absolute top-0 left-4 right-4 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${config.primary}, transparent)`,
                boxShadow: `0 0 8px ${config.glow}`,
              }}
            />

            {/* Header */}
            <div className="text-center pt-1 pb-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs" style={{ color: config.primary }}>{config.symbol}</span>
                <h2 className="font-decorative text-lg font-bold" style={{ color: config.primary }}>
                  {card.name}
                </h2>
                <span className="text-xs" style={{ color: config.primary }}>{config.symbol}</span>
              </div>
              <p className="font-decorative text-xs" style={{ color: `${config.primary}AA` }}>
                {card.nameCn}
              </p>

              {/* Moon phase indicator */}
              {moonPhase && (
                <div
                  className="inline-flex items-center gap-1 mt-2 px-3 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${config.primary}15`,
                    border: `1px solid ${config.primary}33`,
                    color: config.primary,
                  }}
                >
                  <span>☽</span>
                  <span>{moonPhase}</span>
                </div>
              )}

              {/* Keywords */}
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {card.keywords.slice(0, 3).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${config.primary}1A`,
                      border: `1px solid ${config.primary}33`,
                      color: `${config.primary}CC`,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex-shrink-0 flex items-center gap-2 px-2 mb-2">
              <div className="flex-1 h-px" style={{ backgroundColor: `${config.primary}33` }} />
              <span style={{ color: config.primary, opacity: 0.5, fontSize: 8 }}>✦ ✦ ✦</span>
              <div className="flex-1 h-px" style={{ backgroundColor: `${config.primary}33` }} />
            </div>

            {/* Reading text */}
            <div
              className="flex-1 rounded-xl p-3 overflow-y-auto"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: `1px solid ${config.primary}22`,
              }}
            >
              <p className="text-white/90 text-sm leading-relaxed">
                {reading}
              </p>
            </div>

            {/* Affirmation */}
            <div className="flex-shrink-0 mt-2 text-center">
              <p
                className="text-xs italic px-3 py-1.5 rounded-lg"
                style={{
                  color: `${config.primary}DD`,
                  backgroundColor: `${config.primary}11`,
                  border: `1px solid ${config.primary}33`,
                }}
              >
                &ldquo;{card.affirmation}&rdquo;
              </p>
            </div>

            {/* Action step */}
            {card.actionSteps?.[0] && (
              <div className="flex-shrink-0 mt-1.5 text-center">
                <p className="text-white/50 text-xs">
                  ✧ {card.actionSteps[0]}
                </p>
              </div>
            )}

            {/* Bottom border */}
            <div
              className="absolute bottom-0 left-4 right-4 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${config.primary}, transparent)`,
                boxShadow: `0 0 8px ${config.glow}`,
              }}
            />

            {/* Corner ornaments */}
            <CornerOrnament color={config.primary} rotation={0} />
            <CornerOrnament color={config.primary} rotation={90} />
            <CornerOrnament color={config.primary} rotation={180} />
            <CornerOrnament color={config.primary} rotation={270} />
          </div>
        </div>
      </motion.div>

      {/* Glow effect behind card */}
      <div
        className="absolute -inset-2 rounded-3xl -z-10 blur-xl opacity-30"
        style={{
          background: `radial-gradient(ellipse, ${config.glow}44 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}
