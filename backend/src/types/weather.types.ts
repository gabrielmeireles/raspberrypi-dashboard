export type AdvisoryLevel = 
  | 'PERFECT_WEATHER'
  | 'LIGHT_JACKET'
  | 'HEAVY_JACKET'
  | 'FREEZING'
  | 'RAIN_ALERT'
  | 'STORM_ALERT'
  | 'EXTREME_HEAT';

export interface WeatherAdvisor {
  wearJacket: boolean;
  bringUmbrella: boolean;
  advisoryLevel: AdvisoryLevel;
  badgeText: string;
  badgeTone: 'info' | 'warning' | 'alert' | 'success' | 'neutral';
  headline: string;
  details: string[];
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeed: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string; // ISO string
  hourFormatted: string; // e.g. "14:00"
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherIcon: string;
  isDay: boolean;
}

export interface DailyForecast {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Mo", "Di", "Mon", etc.
  formattedDate: string; // "18. Aug"
  minTemp: number;
  maxTemp: number;
  minApparentTemp: number;
  maxApparentTemp: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  weatherCode: number;
  weatherIcon: string;
  sunrise: string;
  sunset: string;
}

export interface WeatherResponse {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  updatedAt: string;
  current: CurrentWeather;
  advisor: WeatherAdvisor;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}
