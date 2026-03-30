// ===== Theme Types =====
export type Theme = 'cyberpunk' | 'oil-painting';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ===== Moon Phase Types =====
export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhase {
  name: MoonPhaseName;
  emoji: string;
  illumination: number; // 0-100
  daysUntilFull: number;
  daysUntilNew: number;
}

// ===== Tarot Card Types =====
export interface TarotCard {
  id: number;
  name: string;
  nameCn: string;
  keywords: string[];
  summary: string;
  reading: {
    love: string;
    career: string;
    health: string;
    spirituality: string;
  };
  affirmation: string;
  action: string;
  tiktokCaption: string;
}

// ===== Daily Reading Types =====
export interface DailyReading {
  card: TarotCard;
  date: string;
  drawsRemaining: number;
}

// ===== Navigation =====
export type NavTab = 'home' | 'draw' | 'collection' | 'profile';
