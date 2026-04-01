-- =============================================
-- Wishing Moon - Supabase Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard -> SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Collections Table
-- Store user's favorited/drawn cards
-- =============================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  is_favorite BOOLEAN DEFAULT TRUE,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(user_id, card_id)
);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own collections
CREATE POLICY "Users can view their own collections" 
  ON collections FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own collections
CREATE POLICY "Users can insert their own collections" 
  ON collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own collections
CREATE POLICY "Users can update their own collections" 
  ON collections FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own collections
CREATE POLICY "Users can delete their own collections" 
  ON collections FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================
-- Daily Draws Table
-- Track each user's daily draw count (max 3 per day)
-- =============================================
CREATE TABLE IF NOT EXISTS daily_draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  draw_date DATE NOT NULL DEFAULT CURRENT_DATE,
  draw_count INTEGER DEFAULT 1,
  category TEXT DEFAULT 'love' CHECK (category IN ('love', 'career', 'health', 'spirituality')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_draws ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own draws
CREATE POLICY "Users can view their own draws" 
  ON daily_draws FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own draws
CREATE POLICY "Users can insert their own draws" 
  ON daily_draws FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own draws
CREATE POLICY "Users can update their own draws" 
  ON daily_draws FOR UPDATE 
  USING (auth.uid() = user_id);

-- =============================================
-- Daily Readings Table (optional for future)
-- Track daily readings for streak counting
-- =============================================
CREATE TABLE IF NOT EXISTS daily_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('love', 'career', 'health', 'spirituality')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One reading per user per day
  CONSTRAINT one_reading_per_day UNIQUE (user_id, (DATE(created_at)))
);

-- Enable Row Level Security
ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own readings
CREATE POLICY "Users can view their own readings" 
  ON daily_readings FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own readings
CREATE POLICY "Users can insert their own readings" 
  ON daily_readings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Indexes for better performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_card_id ON collections(card_id);
CREATE INDEX IF NOT EXISTS idx_daily_draws_user_id ON daily_draws(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_draws_draw_date ON daily_draws(user_id, draw_date);
CREATE INDEX IF NOT EXISTS idx_daily_readings_user_id ON daily_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_readings_created_at ON daily_readings(created_at);

-- =============================================
-- Function to get collection stats
-- =============================================
CREATE OR REPLACE FUNCTION get_collection_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM collections WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- Function to get user's draw count for today
-- =============================================
CREATE OR REPLACE FUNCTION get_today_draw_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(draw_count)::INTEGER, 0)
  FROM daily_draws 
  WHERE user_id = p_user_id 
    AND draw_date = CURRENT_DATE;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- Function to get reading streak
-- =============================================
CREATE OR REPLACE FUNCTION get_reading_streak(p_user_id UUID)
RETURNS INTEGER AS $$
  WITH daily AS (
    SELECT DISTINCT DATE(created_at) as read_date
    FROM daily_draws
    WHERE user_id = p_user_id
    ORDER BY read_date DESC
  ),
  streaks AS (
    SELECT 
      read_date,
      read_date - (ROW_NUMBER() OVER (ORDER BY read_date DESC))::INTEGER as streak_group
    FROM daily
  )
  SELECT COUNT(*)::INTEGER 
  FROM streaks 
  WHERE streak_group = (SELECT streak_group FROM streaks LIMIT 1);
$$ LANGUAGE SQL STABLE;
