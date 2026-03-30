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
    return tarotCards.filter(card => card.id >= 0 && card.id <= 20);
  }
  return tarotCards.filter(card => card.id >= 21 && card.id <= 76);
}

export function getCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCard[] {
  const ranges: Record<string, [number, number]> = {
    wands: [21, 34],
    cups: [35, 48],
    swords: [49, 62],
    pentacles: [63, 76],
  };
  const [start, end] = ranges[suit];
  return tarotCards.filter(card => card.id >= start && card.id <= end);
}

export const MAJOR_ARCANA_IDS = Array.from({ length: 21 }, (_, i) => i);
export const MINOR_ARCANA_IDS = Array.from({ length: 56 }, (_, i) => i + 21);
