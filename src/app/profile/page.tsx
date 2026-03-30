'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Palette, Bell, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const menuItems = [
  { icon: Moon, label: 'Moon Phase Preferences', value: 'Current Phase' },
  { icon: Palette, label: 'Theme', value: 'Cyberpunk' },
  { icon: Bell, label: 'Notifications', value: 'Daily Reminder' },
  { icon: Shield, label: 'Privacy', value: 'Public Profile' },
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </header>

      {/* User Card */}
      <section className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
            🌙
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Moon Walker</h2>
            <p className="text-white/60 text-sm">Free Account</p>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            <p className="text-2xl font-bold text-yellow-400">12</p>
            <p className="text-white/60 text-xs">Cards Drawn</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            <p className="text-2xl font-bold text-pink-400">3</p>
            <p className="text-white/60 text-xs">Favorites</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            <p className="text-2xl font-bold text-purple-400">7</p>
            <p className="text-white/60 text-xs">Day Streak</p>
          </motion.div>
        </div>
      </section>

      {/* Menu */}
      <section className="px-6">
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
            >
              <item.icon className="w-5 h-5 text-white/60" />
              <span className="flex-1 text-left text-white">{item.label}</span>
              <span className="text-white/40 text-sm">{item.value}</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/20"
        >
          <h3 className="text-white font-semibold mb-2">Upgrade to Premium</h3>
          <p className="text-white/60 text-sm mb-4">Unlock unlimited draws, detailed readings, and exclusive features.</p>
          <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl">
            $4.99/month
          </button>
        </motion.div>
      </section>

      <Navbar />
    </main>
  );
}
