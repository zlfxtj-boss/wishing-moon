'use client';

import { useEffect, useState } from 'react';
import { MoonPhase } from '@/types';
import { getMoonPhase, getMoonGreeting } from '@/lib/moon-phase';
import { motion } from 'framer-motion';

export default function MoonPhaseCard() {
  const [phase, setPhase] = useState<MoonPhase | null>(null);

  useEffect(() => {
    setPhase(getMoonPhase());
  }, []);

  if (!phase) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-6xl">{phase.emoji}</span>
        <div>
          <h2 className="text-xl font-semibold text-white">{phase.name}</h2>
          <p className="text-white/60 text-sm">{phase.illumination}% illuminated</p>
        </div>
      </div>
      <p className="text-white/80 text-sm leading-relaxed">{getMoonGreeting(phase)}</p>
      <div className="mt-4 flex gap-4 text-xs text-white/50">
        <span>Full in: {phase.daysUntilFull} days</span>
        <span>New in: {phase.daysUntilNew} days</span>
      </div>
    </motion.div>
  );
}
