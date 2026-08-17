import { i18n } from './i18n/index.svelte.js';

export function formatMinutes(departureInMinutes: number): string {
  if (departureInMinutes <= 0) {
    return i18n.t('home.now');
  }
  return `${departureInMinutes} ${i18n.t('home.min')}`;
}

export function formatTimeHHMM(timestampMs: number | string): string {
  const date = typeof timestampMs === 'string' ? new Date(timestampMs) : new Date(timestampMs);
  return i18n.formatTime(date, { hour: '2-digit', minute: '2-digit' });
}

export function formatFullGermanDate(date: Date = new Date()): string {
  return i18n.formatDate(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
