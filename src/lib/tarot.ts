import type { TarotCard } from '@/types';
import tarotCardsData from '@/data/tarot-cards.json';

export const tarotCards: TarotCard[] = tarotCardsData as TarotCard[];

export function getTarotCardById(id: number): TarotCard | undefined {
  return tarotCards.find(card => card.id === id);
}

export function getRandomTarotCard(): TarotCard {
  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}

export function getCardsByArcana(arcana: 'major' | 'minor'): TarotCard[] {
  if (arcana === 'major') {
    // Major Arcana: IDs 0-21 (22 cards including The World)
    return tarotCards.filter(card => card.id >= 0 && card.id <= 21);
  }
  // Minor Arcana: IDs 22-77 (56 cards)
  return tarotCards.filter(card => card.id >= 22 && card.id <= 77);
}

export function getCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCard[] {
  const ranges: Record<string, [number, number]> = {
    wands: [22, 35],    // 10 numbered + Page, Knight, Queen, King = 14 cards
    cups: [36, 49],      // 10 numbered + Page, Knight, Queen, King = 14 cards
    swords: [50, 63],   // 10 numbered + Page, Knight, Queen, King = 14 cards
    pentacles: [64, 77], // 10 numbered + Page, Knight, Queen, King = 14 cards
  };
  const [start, end] = ranges[suit];
  return tarotCards.filter(card => card.id >= start && card.id <= end);
}

export const MAJOR_ARCANA_IDS = Array.from({ length: 22 }, (_, i) => i);
export const MINOR_ARCANA_IDS = Array.from({ length: 56 }, (_, i) => i + 22);
