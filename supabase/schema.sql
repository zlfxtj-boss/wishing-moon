-- Wishing Moon Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, but we can add profile info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  preferred_theme TEXT DEFAULT 'cyberpunk' CHECK (preferred_theme IN ('cyberpunk', 'oil-painting')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarot Cards table
CREATE TABLE IF NOT EXISTS public.tarot_cards (
  id SERIAL PRIMARY KEY,
  card_name VARCHAR(100) NOT NULL,
  card_name_cn VARCHAR(100),
  keywords TEXT[],
  summary TEXT,
  reading JSONB, -- { love, career, health, spirituality }
  affirmation TEXT,
  action TEXT,
  tiktok_caption TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Draws table
CREATE TABLE IF NOT EXISTS public.daily_draws (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES tarot_cards(id) ON DELETE CASCADE,
  draw_date DATE NOT NULL DEFAULT CURRENT_DATE,
  draw_count INTEGER DEFAULT 1,
  category VARCHAR(20) DEFAULT 'love' CHECK (category IN ('love', 'career', 'health', 'spirituality')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id, draw_date)
);

-- Collections table (cards user has drawn/favorited)
CREATE TABLE IF NOT EXISTS public.collections (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES tarot_cards(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Manifestations table
CREATE TABLE IF NOT EXISTS public.manifestations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  intention TEXT NOT NULL,
  target_moon_phase VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_draws_user_date ON public.daily_draws(user_id, draw_date);
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_manifestations_user ON public.manifestations(user_id);
CREATE INDEX IF NOT EXISTS idx_manifestations_status ON public.manifestations(status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Daily Draws: Users can only see their own draws
CREATE POLICY "Users can view own draws" ON public.daily_draws
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own draws" ON public.daily_draws
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Collections: Users can only see their own collections
CREATE POLICY "Users can view own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

-- Manifestations: Users can only see their own manifestations
CREATE POLICY "Users can view own manifestations" ON public.manifestations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manifestations" ON public.manifestations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manifestations" ON public.manifestations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manifestations" ON public.manifestations
  FOR DELETE USING (auth.uid() = user_id);

-- Tarot cards are public (read-only for everyone)
CREATE POLICY "Anyone can view tarot cards" ON public.tarot_cards
  FOR SELECT USING (true);

-- Function to handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Moon Walker'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
