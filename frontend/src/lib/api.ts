import type { AppConfig, TransitResponse, WeatherResponse } from '../types/dashboard.types.js';

export async function fetchAppConfig(): Promise<AppConfig> {
  const res = await fetch('/api/config');
  if (!res.ok) {
    throw new Error(`Failed to fetch config: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchWeather(): Promise<WeatherResponse> {
  const res = await fetch('/api/weather');
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTransit(): Promise<TransitResponse> {
  const res = await fetch('/api/transit');
  if (!res.ok) {
    throw new Error(`Failed to fetch transit departures: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
