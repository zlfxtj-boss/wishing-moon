'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import MoonPhaseCard from '@/components/features/Home/MoonPhaseCard';
import Navbar from '@/components/layout/Navbar';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Sparkles, Layers, Heart, Moon, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen pb-20" style={{ background: 'var(--bg-gradient-main)' }}>
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Moon className="w-12 h-12 text-yellow-400 mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--text-glow)' }}
          >
            Wishing Moon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/50 text-sm"
          >
            Your Daily Moon Magic
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-2"
        >
          <ThemeToggle />
        </motion.div>
      </header>

      {/* Moon Phase Card */}
      <section className="px-6 mb-6">
        <MoonPhaseCard />
      </section>

      {/* Daily Draw CTA - Main feature */}
      <section className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-6 border"
          style={{
            background: 'var(--bg-gradient-card)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-gradient-btn)' }}>
              <Zap size={18} className="text-black" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Daily Manifestation</h2>
              <p className="text-white/50 text-sm">Tap to receive your card of the day</p>
            </div>
          </div>

          {/* Big Draw Button */}
          <Link
            href="/draw"
            className="block w-full py-4 rounded-2xl font-bold text-center text-lg transition-all hover:scale-[1.02] active:scale-[0.98] neon-pulse"
            style={{
              background: 'var(--bg-gradient-btn)',
              color: '#000',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            Draw Your Card
          </Link>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <Link href="/collection">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl p-4 border transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Layers className="w-6 h-6 mb-2" style={{ color: 'var(--color-secondary)' }} />
            <h3 className="text-white font-medium mb-1">All 78 Cards</h3>
            <p className="text-white/40 text-xs">Browse the complete deck</p>
          </motion.div>
        </Link>
        <Link href="/collection">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-4 border transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Heart className="w-6 h-6 mb-2" style={{ color: 'var(--color-accent)' }} />
            <h3 className="text-white font-medium mb-1">Your Collection</h3>
            <p className="text-white/40 text-xs">Cards you have drawn</p>
          </motion.div>
        </Link>
      </section>

      {/* Add to Home Screen Hint */}
      <section className="px-6 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="rounded-xl p-4 border text-center"
          style={{
            background: 'rgba(251, 191, 36, 0.05)',
            borderColor: 'rgba(251, 191, 36, 0.15)'
          }}
        >
          <p className="text-yellow-400/70 text-xs">
            Add to home screen for the best experience
          </p>
        </motion.div>
      </section>

      <Navbar />
    </main>
  );
}
