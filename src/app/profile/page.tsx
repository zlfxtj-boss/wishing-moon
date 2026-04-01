'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Moon, Palette, Bell, Shield, ChevronRight, LogIn, LogOut, Loader2, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/lib/theme'

interface ProfileStats {
  totalDraws: number
  favorites: number
  streak: number
}

const NOTIFICATIONS_KEY = 'wishing-moon-notifications'
const PRIVACY_KEY = 'wishing-moon-privacy'

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState<ProfileStats>({ totalDraws: 0, favorites: 0, streak: 0 })
  const [loadingStats, setLoadingStats] = useState(false)

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [privacyMode, setPrivacyMode] = useState<'public' | 'private'>('public')
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (message: string) => {
    setToastMessage(message)
    setShowNotificationToast(true)
    setTimeout(() => setShowNotificationToast(false), 2500)
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY)
    if (savedNotifications === 'true') setNotificationsEnabled(true)

    const savedPrivacy = localStorage.getItem(PRIVACY_KEY)
    if (savedPrivacy === 'private') setPrivacyMode('private')
  }, [])

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

  const handleThemeChange = (newTheme: 'cyberpunk' | 'oil-painting') => {
    setTheme(newTheme)
    setShowThemeMenu(false)
    showToast(`Theme changed to ${newTheme === 'cyberpunk' ? 'Cyberpunk' : 'Oil Painting'}`)
  }

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    localStorage.setItem(NOTIFICATIONS_KEY, String(newValue))
    if (newValue) {
      showToast('Daily reminder enabled')
    } else {
      showToast('Daily reminder disabled')
    }
  }

  const handlePrivacyToggle = () => {
    const newValue = privacyMode === 'public' ? 'private' : 'public'
    setPrivacyMode(newValue)
    localStorage.setItem(PRIVACY_KEY, newValue)
    showToast(`Profile set to ${newValue === 'public' ? 'Public' : 'Private'}`)
  }

  const handleMoonPhaseClick = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/30 to-black pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-lg border border-yellow-400/30 text-white px-5 py-3 rounded-xl shadow-lg shadow-yellow-400/10"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-start justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
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

      {/* Settings Menu */}
      <section className="px-6">
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Settings</h2>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">

          {/* Moon Phase - Navigate to home */}
          <motion.button
            onClick={handleMoonPhaseClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <Moon className="w-5 h-5 text-white/60" />
            <span className="flex-1 text-left text-white">Moon Phase</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </motion.button>

          {/* Theme - Show popup */}
          <div className="relative">
            <motion.button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <Palette className="w-5 h-5 text-white/60" />
              <span className="flex-1 text-left text-white">Theme</span>
              <span className="text-white/40 text-sm capitalize">{theme === 'oil-painting' ? 'Oil Painting' : 'Cyberpunk'}</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </motion.button>

            <AnimatePresence>
              {showThemeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full z-50 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => handleThemeChange('cyberpunk')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          theme === 'cyberpunk'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span className="text-sm">Cyberpunk</span>
                        {theme === 'cyberpunk' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-2 h-2 rounded-full bg-yellow-400"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => handleThemeChange('oil-painting')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          theme === 'oil-painting'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Palette size={16} />
                        <span className="text-sm">Oil Painting</span>
                        {theme === 'oil-painting' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-2 h-2 rounded-full bg-yellow-400"
                          />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowThemeMenu(false)}
                      className="w-full flex items-center justify-center gap-1 py-2 border-t border-white/5 text-white/30 hover:text-white/50 transition-colors text-xs"
                    >
                      <X size={12} />
                      Close
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Toggle */}
          <motion.button
            onClick={handleNotificationsToggle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-yellow-400' : 'text-white/60'}`} />
            <span className="flex-1 text-left text-white">Notifications</span>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-yellow-400' : 'bg-white/20'
            }`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </motion.button>

          {/* Privacy Toggle */}
          <motion.button
            onClick={handlePrivacyToggle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors"
          >
            <Shield className={`w-5 h-5 ${privacyMode === 'private' ? 'text-yellow-400' : 'text-white/60'}`} />
            <span className="flex-1 text-left text-white">Privacy</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors ${privacyMode === 'private' ? 'text-yellow-400' : 'text-white/40'}`}>
                Private
              </span>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                privacyMode === 'private' ? 'bg-yellow-400' : 'bg-white/20'
              }`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  privacyMode === 'private' ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
          </motion.button>
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
