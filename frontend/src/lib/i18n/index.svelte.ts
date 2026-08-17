
import { WeatherAdvisor } from '../../types/dashboard.types.js';
import { de } from './locales/de.js';
import { en } from './locales/en.js';
import { pt } from './locales/pt.js';
import type { LocaleInfo, SupportedLocale, Translations } from './types.js';

export const LOCALES: LocaleInfo[] = [
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', intlLocale: 'de-DE' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', intlLocale: 'en-US' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', intlLocale: 'pt-BR' },
];

const translations: Record<SupportedLocale, Translations> = {
  de,
  en,
  pt,
};

const STORAGE_KEY = 'rpi_dashboard_locale';

function getInitialLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (saved && (saved === 'de' || saved === 'en' || saved === 'pt')) {
      return saved;
    }
  }
  return 'de';
}

export class I18nStore {
  locale = $state<SupportedLocale>(getInitialLocale());

  get activeLocaleInfo(): LocaleInfo {
    return LOCALES.find((l) => l.code === this.locale) || LOCALES[0];
  }

  get currentTranslations(): Translations {
    return translations[this.locale] || translations.de;
  }

  setLocale(newLocale: SupportedLocale) {
    if (newLocale === 'de' || newLocale === 'en' || newLocale === 'pt') {
      this.locale = newLocale;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, newLocale);
        } catch {
          // ignore storage errors
        }
      }
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.');
    let cur: any = this.currentTranslations;

    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        cur = null;
        break;
      }
    }

    if (typeof cur !== 'string') {
      // Fallback to German
      let fallbackCur: any = translations.de;
      for (const p of parts) {
        if (fallbackCur && typeof fallbackCur === 'object' && p in fallbackCur) {
          fallbackCur = fallbackCur[p];
        } else {
          fallbackCur = key;
          break;
        }
      }
      cur = typeof fallbackCur === 'string' ? fallbackCur : key;
    }

    if (params) {
      return cur.replace(/\{(\w+)\}/g, (_: string, match: string) => {
        return params[match] !== undefined ? String(params[match]) : `{${match}}`;
      });
    }

    return cur;
  }

  getWeatherLabel(wmoCode: number, isDay: boolean = true): string {
    const cond = this.currentTranslations.weatherConditions[wmoCode];
    if (cond) {
      if (!isDay && cond.night) return cond.night;
      return cond.day;
    }
    // Fallback to German
    const fallbackCond = translations.de.weatherConditions[wmoCode];
    if (fallbackCond) {
      if (!isDay && fallbackCond.night) return fallbackCond.night;
      return fallbackCond.day;
    }
    return isDay ? 'Klar' : 'Klar';
  }

  getAdvisorTexts(advisor: WeatherAdvisor | null | undefined, currentTemp: number = 0, apparentTemp: number = 0) {
    if (!advisor) {
      return {
        badgeText: this.t('advisor.levels.PERFECT_WEATHER.badge'),
        headline: this.t('advisor.levels.PERFECT_WEATHER.headline'),
        details: [this.t('advisor.recommendations.neither')],
      };
    }

    const { advisoryLevel, wearJacket, bringUmbrella } = advisor;
    const advTranslations = this.currentTranslations.advisor;

    let badgeText = advisor.badgeText;
    let headline = advisor.headline;
    const details: string[] = [];

    const tempStr = Math.round(apparentTemp).toString();
    const currentTempStr = Math.round(currentTemp).toString();

    // Determine localized badge and headline
    if (advisoryLevel === 'STORM_ALERT') {
      badgeText = advTranslations.levels.STORM_ALERT.badge;
      headline = advTranslations.levels.STORM_ALERT.headline;
      details.push(advTranslations.levels.STORM_ALERT.detail);
    } else if (advisoryLevel === 'RAIN_ALERT') {
      if (bringUmbrella && advisor.badgeTone === 'alert') {
        badgeText = advTranslations.levels.RAIN_ALERT_ACTIVE.badge;
        headline = advTranslations.levels.RAIN_ALERT_ACTIVE.headline;
        details.push(advTranslations.levels.RAIN_ALERT_ACTIVE.detail.replace('{precip}', '1.0'));
      } else {
        badgeText = advTranslations.levels.RAIN_ALERT_FORECAST.badge;
        headline = advTranslations.levels.RAIN_ALERT_FORECAST.headline;
        details.push(advTranslations.levels.RAIN_ALERT_FORECAST.detail.replace('{prob}', '60'));
      }
    } else if (advisoryLevel === 'FREEZING') {
      badgeText = advTranslations.levels.FREEZING.badge;
      headline = advTranslations.levels.FREEZING.headline;
      details.push(advTranslations.levels.FREEZING.detail.replace('{temp}', tempStr));
    } else if (advisoryLevel === 'HEAVY_JACKET') {
      badgeText = advTranslations.levels.HEAVY_JACKET.badge;
      headline = advTranslations.levels.HEAVY_JACKET.headline;
      details.push(advTranslations.levels.HEAVY_JACKET.detail.replace('{temp}', tempStr));
    } else if (advisoryLevel === 'LIGHT_JACKET') {
      badgeText = advTranslations.levels.LIGHT_JACKET.badge;
      headline = advTranslations.levels.LIGHT_JACKET.headline;
      details.push(advTranslations.levels.LIGHT_JACKET.detail.replace('{temp}', tempStr));
    } else if (advisoryLevel === 'EXTREME_HEAT') {
      badgeText = advTranslations.levels.EXTREME_HEAT.badge;
      headline = advTranslations.levels.EXTREME_HEAT.headline;
      details.push(advTranslations.levels.EXTREME_HEAT.detail.replace('{temp}', currentTempStr));
    } else {
      badgeText = advTranslations.levels.PERFECT_WEATHER.badge;
      headline = advTranslations.levels.PERFECT_WEATHER.headline;
      details.push(advTranslations.levels.PERFECT_WEATHER.detail.replace('{temp}', currentTempStr));
    }

    // Recommendation summary
    if (wearJacket && bringUmbrella) {
      details.push(advTranslations.recommendations.jacketAndUmbrella);
    } else if (wearJacket) {
      details.push(advTranslations.recommendations.jacketOnly);
    } else if (bringUmbrella) {
      details.push(advTranslations.recommendations.umbrellaOnly);
    } else {
      details.push(advTranslations.recommendations.neither);
    }

    return {
      badgeText,
      headline,
      details,
    };
  }

  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'object' ? date : new Date(date);
    const intlLocale = this.activeLocaleInfo.intlLocale;
    return d.toLocaleDateString(intlLocale, options);
  }

  formatTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'object' ? date : new Date(date);
    const intlLocale = this.activeLocaleInfo.intlLocale;
    return d.toLocaleTimeString(intlLocale, options || { hour: '2-digit', minute: '2-digit' });
  }

  formatWeekday(date: Date | string | number, format: 'long' | 'short' | 'narrow' = 'long'): string {
    const d = typeof date === 'object' ? date : new Date(date);
    const intlLocale = this.activeLocaleInfo.intlLocale;
    return d.toLocaleDateString(intlLocale, { weekday: format });
  }

  formatDayAndMonth(date: Date | string | number): string {
    const d = typeof date === 'object' ? date : new Date(date);
    const intlLocale = this.activeLocaleInfo.intlLocale;
    return d.toLocaleDateString(intlLocale, { day: 'numeric', month: 'short' });
  }
}

export const i18n = new I18nStore();
export { type LocaleInfo, type SupportedLocale, type Translations } from './types.js';
