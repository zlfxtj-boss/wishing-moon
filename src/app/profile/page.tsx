'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Moon, Palette, Bell, Shield, ChevronRight, LogIn, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileStats {
  totalDraws: number
  favorites: number
  streak: number
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [stats, setStats] = useState<ProfileStats>({ totalDraws: 0, favorites: 0, streak: 0 })
  const [loadingStats, setLoadingStats] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!user) return
    setLoadingStats(true)
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        const collections = data.collections || []
        const history = data.history || []
        
        // Calculate streak (consecutive days with draws)
        let streak = 0
        const today = new Date()
        const drawDates = [...new Set(history.map((h: any) => h.draw_date))].sort().reverse()
        for (let i = 0; i < drawDates.length; i++) {
          const expected = new Date(today)
          expected.setDate(expected.getDate() - i)
          const expectedStr = expected.toISOString().split('T')[0]
          if (drawDates.includes(expectedStr)) {
            streak++
          } else {
            break
          }
        }

        setStats({
          totalDraws: history.length,
          favorites: collections.length,
          streak,
        })
      }
    } finally {
      setLoadingStats(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchStats()
  }, [user, fetchStats])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const menuItems = [
    { icon: Moon, label: 'Moon Phase', value: 'Current Phase', href: '/' },
    { icon: Palette, label: 'Theme', value: 'Dark Cosmic', href: null },
    { icon: Bell, label: 'Notifications', value: 'Daily Reminder', href: null },
    { icon: Shield, label: 'Privacy', value: 'Public Profile', href: null },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-start justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-sm"
          >
            <LogOut size={16} />
          </button>
        )}
      </header>

      {/* Not logged in */}
      {!authLoading && !user && (
        <section className="px-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-2xl mx-auto mb-4">
              🌙
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Welcome, Moon Walker</h2>
            <p className="text-white/60 text-sm mb-4">Sign in to save your draws and build your collection</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          </motion.div>
        </section>
      )}

      {/* User Card */}
      {user && (
        <section className="px-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
              {user.user_metadata?.username?.[0]?.toUpperCase() || '🌙'}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                {user.user_metadata?.username || 'Moon Walker'}
              </h2>
              <p className="text-white/60 text-sm">
                {user.email}
              </p>
              <p className="text-yellow-400/60 text-xs mt-1">Free Account</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* Stats */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-yellow-400 mx-auto animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-yellow-400">{stats.totalDraws}</p>
            )}
            <p className="text-white/60 text-xs">Cards Drawn</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-pink-400 mx-auto animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-pink-400">{stats.favorites}</p>
            )}
            <p className="text-white/60 text-xs">Favorites</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
          >
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-purple-400 mx-auto animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-purple-400">{stats.streak}</p>
            )}
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
  )
}
