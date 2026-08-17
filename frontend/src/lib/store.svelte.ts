import type {
  ActiveTab,
  AppConfig,
  NormalizedDeparture,
  TransitResponse,
  WeatherResponse,
} from '../types/dashboard.types.js';
import { fetchAppConfig, fetchTransit, fetchWeather } from './api.js';
import { i18n } from './i18n/index.svelte.js';

export class DashboardStore {
  // Svelte 5 Runes
  activeTab = $state<ActiveTab>('home');
  config = $state<AppConfig | null>(null);
  weather = $state<WeatherResponse | null>(null);
  transit = $state<TransitResponse | null>(null);

  isRefreshing = $state(false);
  lastUpdated = $state<{ weather: Date | null; transit: Date | null }>({
    weather: null,
    transit: null,
  });
  errors = $state<{ weather: string | null; transit: string | null }>({
    weather: null,
    transit: null,
  });

  private weatherTimer: ReturnType<typeof setInterval> | null = null;
  private transitTimer: ReturnType<typeof setInterval> | null = null;
  private configTimer: ReturnType<typeof setInterval> | null = null;

  // Derived states
  upcomingTrains = $derived<NormalizedDeparture[]>(() => {
    return this.transit?.byCategory.trains.slice(0, 4) || [];
  });

  upcomingBusesAndTrams = $derived<NormalizedDeparture[]>(() => {
    return this.transit?.byCategory.busesAndTrams.slice(0, 4) || [];
  });

  async init() {
    await this.loadConfig();
    await this.refreshAll();
    this.startPolling();
  }

  setTab(tab: ActiveTab) {
    this.activeTab = tab;
  }

  async loadConfig() {
    try {
      this.config = await fetchAppConfig();
    } catch (err: any) {
      console.error('[Store] Failed to load config:', err);
    }
  }

  async refreshWeather() {
    try {
      this.errors.weather = null;
      this.weather = await fetchWeather();
      this.lastUpdated.weather = new Date();
    } catch (err: any) {
      console.error('[Store] Failed to fetch weather:', err);
      this.errors.weather = err?.message || i18n.t('common.weatherError');
    }
  }

  async refreshTransit() {
    try {
      this.errors.transit = null;
      this.transit = await fetchTransit();
      this.lastUpdated.transit = new Date();
    } catch (err: any) {
      console.error('[Store] Failed to fetch transit:', err);
      this.errors.transit = err?.message || i18n.t('common.transitError');
    }
  }

  async refreshAll() {
    this.isRefreshing = true;
    try {
      await Promise.allSettled([this.refreshWeather(), this.refreshTransit()]);
    } finally {
      this.isRefreshing = false;
    }
  }

  startPolling() {
    this.stopPolling();

    const weatherInterval = this.config?.ui.weatherPollIntervalMs || 300000;
    const transitInterval = this.config?.ui.transitPollIntervalMs || 30000;
    const configInterval = this.config?.ui.configPollIntervalMs || 600000;

    this.weatherTimer = setInterval(() => {
      this.refreshWeather();
    }, weatherInterval);

    this.transitTimer = setInterval(() => {
      this.refreshTransit();
    }, transitInterval);

    this.configTimer = setInterval(() => {
      this.loadConfig();
    }, configInterval);
  }

  stopPolling() {
    if (this.weatherTimer) clearInterval(this.weatherTimer);
    if (this.transitTimer) clearInterval(this.transitTimer);
    if (this.configTimer) clearInterval(this.configTimer);
    this.weatherTimer = null;
    this.transitTimer = null;
    this.configTimer = null;
  }
}

export const store = new DashboardStore();
