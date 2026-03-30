# Wishing Moon - Your Daily Moon Magic

A mystical tarot reading app with moon phase tracking, designed for the US market.

## Features

- **Daily Tarot Draw**: Get your daily card reading from a 78-card Osho Zen deck
- **Moon Phase Tracking**: Real-time moon phase information and rituals
- **Card Collection**: Browse and collect all 78 tarot cards
- **Multiple Reading Categories**: Love, Career, Health, and Spirituality
- **Share to Social**: Share your readings on TikTok and social media
- **Beautiful Dark UI**: Cyberpunk-inspired mystical design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Animations**: Framer Motion
- **Moon Calculations**: SunCalc

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your `anon key` and `service role key` from Project Settings
3. Create the database tables using the schema in `supabase/schema.sql`

## Database Schema

```sql
-- Users (managed by Supabase Auth)

-- Tarot Cards (78 cards)
CREATE TABLE tarot_cards (
  id SERIAL PRIMARY KEY,
  card_name VARCHAR(100) NOT NULL,
  card_name_cn VARCHAR(100),
  keywords TEXT[],
  summary TEXT,
  reading JSONB,
  affirmation TEXT,
  action TEXT,
  tiktok_caption TEXT
);

-- Daily Draws
CREATE TABLE daily_draws (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_id INTEGER REFERENCES tarot_cards(id),
  draw_date DATE NOT NULL,
  draw_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_id INTEGER REFERENCES tarot_cards(id),
  collected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Manifestations
CREATE TABLE manifestations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  intention TEXT NOT NULL,
  target_moon_phase VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Vercel

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

### Automatic Deployments

Connect your GitHub repository to Vercel for automatic deployments on push.

## Project Structure

```
wishing-moon/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── draw/         # Daily draw page
│   │   ├── collection/   # Card collection page
│   │   └── profile/      # User profile page
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Navbar)
│   │   └── features/     # Feature components
│   ├── lib/              # Utility functions
│   │   ├── tarot.ts      # Tarot card data
│   │   ├── moon-phase.ts # Moon phase calculations
│   │   └── supabase.ts   # Supabase client
│   ├── types/            # TypeScript types
│   └── data/             # Static data files
├── public/               # Static assets
├── supabase/             # Database schema
└── scripts/              # Build scripts
```

## License

Private - All rights reserved
