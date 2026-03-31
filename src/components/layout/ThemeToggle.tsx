'use client';

import { useTheme } from '@/lib/theme';
import { Palette, Sparkles } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white text-sm"
      title={`Switch to ${theme === 'cyberpunk' ? 'Oil Painting' : 'Cyberpunk'} theme`}
    >
      {theme === 'cyberpunk' ? (
        <>
          <Sparkles size={14} className="text-yellow-400" />
          <span>Cyberpunk</span>
        </>
      ) : (
        <>
          <Palette size={14} className="text-amber-400" />
          <span>Oil Painting</span>
        </>
      )}
    </button>
  );
}
