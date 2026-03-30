import type { MoonPhase, MoonPhaseName } from '@/types';

// Simplified moon phase calculation based on lunisolar cycle
// Reference: known new moon date for accuracy
function getDaysSinceNewMoon(date: Date): number {
  // Known new moon: January 6, 2000 (Julian Day 2451550.1)
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const diffMs = date.getTime() - knownNewMoon;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays;
}

function getSynodicMonth(): number {
  return 29.53058867; // Average lunar month in days
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const daysSinceNew = getDaysSinceNewMoon(date) % getSynodicMonth();
  const cyclePosition = daysSinceNew / getSynodicMonth(); // 0 to 1

  const illumination = Math.round((1 - Math.cos(2 * Math.PI * cyclePosition)) / 2 * 100);

  // Determine phase name
  let name: MoonPhaseName;
  if (cyclePosition < 0.0625) name = 'New Moon';
  else if (cyclePosition < 0.1875) name = 'Waxing Crescent';
  else if (cyclePosition < 0.3125) name = 'First Quarter';
  else if (cyclePosition < 0.4375) name = 'Waxing Gibbous';
  else if (cyclePosition < 0.5625) name = 'Full Moon';
  else if (cyclePosition < 0.6875) name = 'Waning Gibbous';
  else if (cyclePosition < 0.8125) name = 'Last Quarter';
  else if (cyclePosition < 0.9375) name = 'Waning Crescent';
  else name = 'New Moon';

  // Days until next full/new moon
  const daysUntilFull = cyclePosition < 0.5
    ? Math.round((0.5 - cyclePosition) * getSynodicMonth())
    : Math.round((1.5 - cyclePosition) * getSynodicMonth());

  const daysUntilNew = cyclePosition < 0.03
    ? 0
    : Math.round((1 - cyclePosition) * getSynodicMonth());

  // Emoji representation
  const emoji = getMoonEmoji(cyclePosition, illumination);

  return { name, emoji, illumination, daysUntilFull, daysUntilNew };
}

function getMoonEmoji(_position: number, illumination: number): string {
  if (illumination < 5) return '🌑';
  if (illumination < 20) return '🌒';
  if (illumination < 40) return '🌓';
  if (illumination < 60) return '🌔';
  if (illumination < 80) return '🌕';
  if (illumination < 95) return '🌖';
  return '🌘';
}

export function getMoonGreeting(phase: MoonPhase): string {
  const hour = new Date().getHours();
  const isEvening = hour >= 17 || hour < 6;

  const greetings: Record<MoonPhaseName, string> = {
    'New Moon': "New beginnings await. Set your intentions.",
    'Waxing Crescent': "Your intentions are growing. Stay focused.",
    'First Quarter': "Action is powerful now. Trust your path.",
    'Waxing Gibbous': "Refine your direction. You're almost there.",
    'Full Moon': "Peak energy. Honor your achievements tonight.",
    'Waning Gibbous': "Gratitude amplifies your power.",
    'Last Quarter': "Release what no longer serves you.",
    'Waning Crescent': "Rest and reflect. A new cycle approaches.",
  };

  const base = greetings[phase.name];
  const timeGreeting = isEvening ? 'Good evening' : 'Good morning';

  return `${timeGreeting}, seeker. ${base}`;
}

export function getSpecialMoonMessage(phase: MoonPhase): string | null {
  if (phase.name === 'New Moon') {
    return "This is the perfect time for setting new intentions.";
  }
  if (phase.name === 'Full Moon') {
    return "Tonight's full moon energy is at its peak!";
  }
  return null;
}
