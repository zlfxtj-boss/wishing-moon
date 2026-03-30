'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import MoonPhaseCard from '@/components/features/Home/MoonPhaseCard';
import Navbar from '@/components/layout/Navbar';
import { Sparkles, Layers, Heart, Moon } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <Moon className="w-16 h-16 mx-auto text-yellow-400" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Wishing Moon
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/60"
        >
          Your Daily Moon Magic
        </motion.p>
      </header>

      {/* Moon Phase Card */}
      <section className="px-6 mb-8">
        <MoonPhaseCard />
      </section>

      {/* Daily Draw CTA */}
      <section className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-6 border border-yellow-500/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Your Daily Reading Awaits</h2>
              <p className="text-white/60 text-sm">Draw your card for today</p>
            </div>
          </div>
          <Link
            href="/draw"
            className="block w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-colors text-center"
          >
            Draw Your Card
          </Link>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 rounded-2xl p-4 border border-white/10"
        >
          <Layers className="w-6 h-6 text-purple-400 mb-2" />
          <h3 className="text-white font-medium mb-1">All 78 Cards</h3>
          <p className="text-white/40 text-xs">Browse the complete deck</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 rounded-2xl p-4 border border-white/10"
        >
          <Heart className="w-6 h-6 text-pink-400 mb-2" />
          <h3 className="text-white font-medium mb-1">Your Collection</h3>
          <p className="text-white/40 text-xs">Cards you've drawn</p>
        </motion.div>
      </section>

      <Navbar />
    </main>
  );
}
