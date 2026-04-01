'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { TarotCard } from '@/types'

// Suit colors for different card types
const SUIT_CONFIG: Record<string, { primary: string; secondary: string; glow: string; symbol: string; accent: string }> = {
  major: { primary: '#C9A227', secondary: '#7B2FBE', glow: '#C9A227', symbol: '✦', accent: '#FFD700' },
  wands: { primary: '#E07B39', secondary: '#8B4513', glow: '#FF9F43', symbol: '⚡', accent: '#FF6B35' },
  cups: { primary: '#4A90D9', secondary: '#1E3A5F', glow: '#54A0FF', symbol: '❋', accent: '#00CED1' },
  swords: { primary: '#8E8EAF', secondary: '#2D2D4E', glow: '#C0C0E0', symbol: '⬡', accent: '#9370DB' },
  pentacles: { primary: '#27AE60', secondary: '#1A4D2E', glow: '#2ECC71', symbol: '⬢', accent: '#50C878' },
}

function getCardConfig(cardId: number) {
  if (cardId <= 21) return SUIT_CONFIG.major
  if (cardId <= 35) return SUIT_CONFIG.wands
  if (cardId <= 49) return SUIT_CONFIG.cups
  if (cardId <= 63) return SUIT_CONFIG.swords
  return SUIT_CONFIG.pentacles
}

// Constellation symbols for decoration
const CONSTELLATION_SYMBOLS = ['✧', '⋆', '∘', '◈', '◇', '✶', '✷', '⁂', '✺']

// Generate random stars for the background
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }))
}

// SVG decorative corner ornament with constellation style
function CornerOrnament({ color, rotation }: { color: string; rotation: number }) {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        transform: `rotate(${rotation}deg)`,
        opacity: 0.8,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1 }}
    >
      {/* Outer arc */}
      <path
        d="M4 4 Q4 20 20 20 Q4 20 4 36"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Inner decorative dots */}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.6" />
      <circle cx="8" cy="8" r="1" fill={color} opacity="0.4" />
      {/* Star accent */}
      <text x="16" y="16" fill={color} fontSize="6" opacity="0.7">✧</text>
    </motion.svg>
  )
}

// Starfield background component
function StarfieldBackground({ config }: { config: ReturnType<typeof getCardConfig> }) {
  const stars = useRef(generateStars(50))
  
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      {/* Deep space gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${config.secondary}15 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${config.primary}10 0%, transparent 40%),
            linear-gradient(180deg, #0D0B1E 0%, #1A1235 50%, #0D0B1E 100%)
          `,
        }}
      />
      
      {/* Stars */}
      {stars.current.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.id % 5 === 0 ? config.primary : '#FFFFFF',
            boxShadow: star.id % 10 === 0 ? `0 0 ${star.size * 2}px ${config.glow}` : 'none',
          }}
          animate={{
            opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Nebula effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, ${config.primary}30 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Animated constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.line
          x1="10%" y1="20%" x2="30%" y2="40%"
          stroke={config.primary}
          strokeWidth="0.5"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.line
          x1="70%" y1="30%" x2="85%" y2="60%"
          stroke={config.primary}
          strokeWidth="0.5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.line
          x1="20%" y1="70%" x2="50%" y2="80%"
          stroke={config.primary}
          strokeWidth="0.5"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </svg>
    </div>
  )
}

// Card front with REAL IMAGE and enhanced design
function CardFrontArt({ card, config }: { card: TarotCard; config: ReturnType<typeof getCardConfig> }) {
  const isMajor = card.id <= 21
  const cardNum = card.id
  
  // Image path for real tarot card image
  const imagePath = `/tarot-cards/tarot_${String(card.id).padStart(2, '0')}.jpg`

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Starfield background */}
      <StarfieldBackground config={config} />
      
      {/* REAL TAROT CARD IMAGE as background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${imagePath}')`,
          opacity: 0.85,
        }}
      />
      
      {/* Dark gradient overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(13,11,30,0.95) 0%, rgba(13,11,30,0.5) 35%, rgba(13,11,30,0.2) 60%, rgba(13,11,30,0.4) 100%)',
        }}
      />
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
        }}
      />

      {/* Card number badge - enhanced with glow */}
      <motion.div
        className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center font-decorative font-bold text-sm"
        style={{
          backgroundColor: `${config.primary}EE`,
          border: `2px solid ${config.accent}`,
          color: '#0D0B1E',
          boxShadow: `0 0 20px ${config.glow}66, 0 0 40px ${config.glow}33`,
        }}
        whileHover={{ scale: 1.1 }}
      >
        {cardNum}
      </motion.div>

      {/* Arcana label */}
      <motion.div
        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-decorative tracking-wider uppercase"
        style={{
          backgroundColor: `${config.primary}DD`,
          border: `1px solid ${config.accent}`,
          color: '#0D0B1E',
          boxShadow: `0 0 10px ${config.glow}44`,
        }}
        whileHover={{ scale: 1.05 }}
      >
        {isMajor ? 'Major' : 'Minor'}
      </motion.div>

      {/* Suit indicator */}
      <div
        className="absolute bottom-16 right-3 text-2xl opacity-60"
        style={{ color: config.primary }}
      >
        {config.symbol}
      </div>

      {/* Card name - bottom area with enhanced styling */}
      <div className="absolute bottom-0 left-0 right-0 p-4" style={{
        background: 'linear-gradient(to top, rgba(13,11,30,0.98) 0%, rgba(13,11,30,0.7) 50%, transparent 100%)',
      }}>
        {/* Decorative line above title */}
        <div 
          className="w-12 h-0.5 mx-auto mb-2 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${config.primary}, transparent)`,
            boxShadow: `0 0 8px ${config.glow}`,
          }}
        />
        <h2 className="font-decorative text-lg font-bold text-center leading-tight" style={{ color: config.primary }}>
          {card.name}
        </h2>
        <p className="font-decorative text-xs text-center mt-0.5" style={{ color: `${config.primary}AA` }}>
          {card.nameCn}
        </p>
        {/* Decorative symbols */}
        <div className="flex justify-center gap-2 mt-1">
          {[0, 1, 2].map(i => (
            <span key={i} style={{ color: config.primary, opacity: 0.4, fontSize: 8 }}>
              {CONSTELLATION_SYMBOLS[i]}
            </span>
          ))}
        </div>
      </div>

      {/* Enhanced golden border with glow effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `2px solid ${config.primary}88`,
          boxShadow: `
            inset 0 0 30px ${config.glow}22,
            inset 0 0 60px ${config.glow}11,
            0 0 20px ${config.glow}22
          `,
        }}
      />
      
      {/* Outer glow ring */}
      <div
        className="absolute -inset-1 rounded-3xl pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, transparent 60%, ${config.glow}33 100%)`,
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
  onFlip?: () => void
}

export default function TarotCardFlip({ card, moonPhase, category, showReading, onFlip }: TarotCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const config = getCardConfig(card.id)
  const cardRef = useRef<HTMLDivElement>(null)

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
      onFlip?.()
    }
    setIsFlipped(!isFlipped)
  }

  // Emit flip event for music
  useEffect(() => {
    if (hasInteracted && typeof window !== 'undefined') {
      const event = new CustomEvent('tarotCardFlipped', { detail: { cardId: card.id } })
      window.dispatchEvent(event)
    }
  }, [hasInteracted, card.id])

  return (
    <div className="w-full h-full" style={{ perspective: '1500px' }}>
      {/* Glow effect behind card */}
      <motion.div
        className="absolute -inset-4 rounded-3xl -z-10"
        style={{
          background: `radial-gradient(ellipse, ${config.glow}22 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isFlipped ? 0.6 : 0.3,
          scale: isFlipped ? 1.05 : 1,
        }}
        transition={{ duration: 0.7 }}
      />
      
      <motion.div
        ref={cardRef}
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
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
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none"
            >
              <motion.div
                animate={{ y: [0, -8, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="px-5 py-2.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: `1.5px solid ${config.primary}`,
                  color: config.primary,
                  boxShadow: `0 0 20px ${config.glow}44`,
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
          {/* Back background with cosmic theme */}
          <div
            className="relative w-full h-full p-4 flex flex-col"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, ${config.secondary}20 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, ${config.primary}15 0%, transparent 50%),
                linear-gradient(160deg, #1A1235 0%, #0D0B1E 50%, #1A0F2E 100%)
              `,
            }}
          >
            {/* Starfield on back too */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.4 + 0.1,
                }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Decorative top border with glow */}
            <motion.div
              className="absolute top-0 left-4 right-4 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${config.primary}, transparent)`,
                boxShadow: `0 0 12px ${config.glow}`,
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Header */}
            <div className="text-center pt-1 pb-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs" style={{ color: config.primary }}>{config.symbol}</span>
                <motion.h2
                  className="font-decorative text-lg font-bold"
                  style={{ color: config.primary }}
                  animate={{ textShadow: [`0 0 10px ${config.glow}`, `0 0 20px ${config.glow}`, `0 0 10px ${config.glow}`] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {card.name}
                </motion.h2>
                <span className="text-xs" style={{ color: config.primary }}>{config.symbol}</span>
              </div>
              <p className="font-decorative text-xs" style={{ color: `${config.primary}AA` }}>
                {card.nameCn}
              </p>

              {/* Moon phase indicator */}
              {moonPhase && (
                <motion.div
                  className="inline-flex items-center gap-1 mt-2 px-3 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${config.primary}15`,
                    border: `1px solid ${config.primary}44`,
                    color: config.primary,
                    boxShadow: `0 0 10px ${config.glow}22`,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span>☽</span>
                  <span>{moonPhase}</span>
                </motion.div>
              )}

              {/* Keywords */}
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {card.keywords.slice(0, 3).map((kw, i) => (
                  <motion.span
                    key={kw}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${config.primary}1A`,
                      border: `1px solid ${config.primary}44`,
                      color: `${config.primary}CC`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {kw}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Divider with decorative elements */}
            <div className="flex-shrink-0 flex items-center gap-2 px-2 mb-2">
              <motion.div
                className="flex-1 h-px"
                style={{ backgroundColor: `${config.primary}33` }}
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.span
                style={{ color: config.primary, opacity: 0.5, fontSize: 8 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✦ ✦ ✦
              </motion.span>
              <motion.div
                className="flex-1 h-px"
                style={{ backgroundColor: `${config.primary}33` }}
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
            </div>

            {/* Reading text */}
            <motion.div
              className="flex-1 rounded-xl p-3 overflow-y-auto"
              style={{
                backgroundColor: 'rgba(0,0,0,0.35)',
                border: `1px solid ${config.primary}22`,
                boxShadow: `inset 0 0 20px ${config.glow}11`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/90 text-sm leading-relaxed">
                {reading}
              </p>
            </motion.div>

            {/* Affirmation */}
            <motion.div
              className="flex-shrink-0 mt-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p
                className="text-xs italic px-3 py-1.5 rounded-lg"
                style={{
                  color: `${config.primary}DD`,
                  backgroundColor: `${config.primary}11`,
                  border: `1px solid ${config.primary}33`,
                  textShadow: `0 0 10px ${config.glow}44`,
                }}
              >
                &ldquo;{card.affirmation}&rdquo;
              </p>
            </motion.div>

            {/* Action step */}
            {card.actionSteps?.[0] && (
              <motion.div
                className="flex-shrink-0 mt-1.5 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-white/50 text-xs">
                  ✧ {card.actionSteps[0]}
                </p>
              </motion.div>
            )}

            {/* Bottom border with glow */}
            <motion.div
              className="absolute bottom-0 left-4 right-4 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${config.primary}, transparent)`,
                boxShadow: `0 0 12px ${config.glow}`,
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />

            {/* Corner ornaments */}
            <CornerOrnament color={config.primary} rotation={0} />
            <CornerOrnament color={config.primary} rotation={90} />
            <CornerOrnament color={config.primary} rotation={180} />
            <CornerOrnament color={config.primary} rotation={270} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
