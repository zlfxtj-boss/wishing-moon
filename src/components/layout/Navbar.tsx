'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Home, Layers, Heart, User, LogOut, Palette } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/draw', icon: Layers, label: 'Draw' },
  { href: '/collection', icon: Heart, label: 'Collection' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically import supabase client
    async function initSupabase() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseAnonKey || 
            supabaseUrl === 'your_supabase_project_url') {
          return;
        }
        
        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(client);
        
        // Get initial session
        const { data: { session } } = await client.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Failed to initialize Supabase in Navbar:', err);
      }
    }
    
    initSupabase();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // Don't render user-specific stuff until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-white/40"
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
        
        {/* Theme Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Palette size={20} />
            <span className="text-xs font-medium">Theme</span>
          </button>
          
          <AnimatePresence>
            {showThemeMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowThemeMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/95 backdrop-blur-lg border border-white/20 rounded-xl p-2 min-w-[140px] z-50"
                >
                  <button
                    onClick={() => {
                      if (theme !== 'cyberpunk') toggleTheme();
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      theme === 'cyberpunk' 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Moon size={16} />
                    <span>Cyberpunk</span>
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== 'oil-painting') toggleTheme();
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      theme === 'oil-painting' 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Palette size={16} />
                    <span>Oil Painting</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Status / Auth Button */}
        {user ? (
          <div className="relative">
            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 px-3 py-2 text-white/60 hover:text-white transition-all"
            >
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-1 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut size={20} className="rotate-180" />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
