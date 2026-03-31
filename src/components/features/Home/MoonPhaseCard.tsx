'use client';

import { motion } from 'framer-motion';
import { getMoonPhase, getMoonGreeting, getSpecialMoonMessage } from '@/lib/moon-phase';

export default function MoonPhaseCard() {
  const moon = getMoonPhase();
  const greeting = getMoonGreeting(moon);
  const specialMessage = getSpecialMoonMessage(moon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-indigo-950/80 to-purple-950/60 rounded-3xl p-6 border border-white/10 backdrop-blur-sm"
    >
      {/* Moon Visual */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {moon.emoji}
        </motion.div>
        <div>
          <h2 className="text-white font-semibold text-lg">{moon.name}</h2>
          <p className="text-white/60 text-sm">{moon.illumination}% illuminated</p>
        </div>
      </div>

      {/* Greeting */}
      <p className="text-white/80 text-sm mb-3 leading-relaxed">
        {greeting}
      </p>

      {/* Special Message */}
      {specialMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4"
        >
          <p className="text-yellow-400/90 text-xs">{specialMessage}</p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-xl px-4 py-3 text-center">
          <p className="text-white/40 text-xs mb-1">Next Full Moon</p>
          <p className="text-white font-semibold text-sm">{moon.daysUntilFull} days</p>
        </div>
        <div className="bg-black/20 rounded-xl px-4 py-3 text-center">
          <p className="text-white/40 text-xs mb-1">Next New Moon</p>
          <p className="text-white font-semibold text-sm">{moon.daysUntilNew} days</p>
        </div>
      </div>
    </motion.div>
  );
}
