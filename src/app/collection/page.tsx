'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { tarotCards } from '@/lib/tarot';

export default function CollectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArcana, setSelectedArcana] = useState<'all' | 'major' | 'minor'>('all');

  const filteredCards = tarotCards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.nameCn.includes(searchQuery);
    const matchesArcana = selectedArcana === 'all' ||
      (selectedArcana === 'major' && card.id <= 20) ||
      (selectedArcana === 'minor' && card.id > 20);
    return matchesSearch && matchesArcana;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Collection</h1>
        <p className="text-white/60 text-sm mt-1">{tarotCards.length} cards in your deck</p>
      </header>

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

      {/* Filters */}
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

      {/* Cards Grid */}
      <section className="px-6">
        <div className="grid grid-cols-3 gap-3">
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="aspect-[2/3] bg-gradient-to-br from-purple-800/50 to-indigo-900/50 rounded-xl border border-white/10 p-2 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl">{card.id}</span>
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-medium truncate">{card.name}</p>
                <p className="text-yellow-400/60 text-xs">{card.nameCn}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Navbar />
    </main>
  );
}
