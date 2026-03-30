'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Heart, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { tarotCards, getRandomTarotCard } from '@/lib/tarot';
import type { TarotCard } from '@/types';

export default function DrawPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [category, setCategory] = useState<'love' | 'career' | 'health' | 'spirituality'>('love');

  const handleDraw = () => {
    setIsDrawing(true);
    setShowResult(false);
    
    setTimeout(() => {
      const card = getRandomTarotCard();
      setDrawnCard(card);
      setIsDrawing(false);
      setShowResult(true);
    }, 2000);
  };

  const handleShare = () => {
    if (!drawnCard) return;
    const text = `${drawnCard.tiktokCaption}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Daily Draw</h1>
        <p className="text-white/60 text-sm mt-1">Receive your card of the day</p>
      </header>

      {/* Card Area */}
      <section className="px-6 mb-8">
        <div className="aspect-[2/3] max-w-xs mx-auto relative">
          <AnimatePresence mode="wait">
            {isDrawing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 0 }}
                animate={{ opacity: 1, scale: 1, rotateY: 360 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl border-2 border-yellow-400/50 flex items-center justify-center"
              >
                <RefreshCw className="w-16 h-16 text-yellow-400 animate-spin" />
              </motion.div>
            )}
            {!isDrawing && !showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl border-2 border-white/20 flex items-center justify-center"
              >
                <p className="text-white/40 text-center px-4">Tap the button below<br/>to draw your card</p>
              </motion.div>
            )}
            {showResult && drawnCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 rounded-2xl border-2 border-yellow-400/50 shadow-lg shadow-purple-500/20 flex flex-col p-4"
              >
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white">{drawnCard.name}</h2>
                  <p className="text-yellow-400 text-sm">{drawnCard.nameCn}</p>
                </div>
                <div className="flex-1 bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {drawnCard.reading[category]}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400/80 text-xs italic">"{drawnCard.affirmation}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Category Selector */}
      {showResult && (
        <section className="px-6 mb-6">
          <div className="flex gap-2 justify-center">
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

      {/* Draw Button */}
      <section className="px-6">
        {!showResult ? (
          <button
            onClick={handleDraw}
            disabled={isDrawing}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDrawing ? 'Drawing...' : 'Draw Your Card'}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleDraw}
              className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Draw Again
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        )}
      </section>

      <Navbar />
    </main>
  );
}
