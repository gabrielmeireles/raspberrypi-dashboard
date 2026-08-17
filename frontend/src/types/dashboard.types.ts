export type ActiveTab = 'home' | 'weather' | 'transit';

export type TransportProduct = 'U_BAHN' | 'S_BAHN' | 'TRAM' | 'BUS' | 'REGIONAL_BUS';
export type TransitCategory = 'TRAIN' | 'BUS_TRAM';

export interface StationConfig {
  id: string;
  name: string;
  allowedProducts?: TransportProduct[];
  lines?: string[];
  directions?: string[];
}

export interface WeatherConfig {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface UIConfig {
  weatherPollIntervalMs: number;
  transitPollIntervalMs: number;
  configPollIntervalMs: number;
  theme: 'dark' | 'light';
  locale: string;
  timeFormat: '24h' | '12h';
}

export interface AppConfig {
  weather: WeatherConfig;
  transit: {
    stations: StationConfig[];
    maxDeparturesPerStation: number;
  };
  ui: UIConfig;
}

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
  time: string;
  hourFormatted: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherIcon: string;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  formattedDate: string;
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

export interface NormalizedDeparture {
  id: string;
  stationId: string;
  stationName: string;
  line: string;
  destination: string;
  product: TransportProduct;
  category: TransitCategory;
  plannedTime: number;
  realtimeTime: number;
  delayMinutes: number;
  departureInMinutes: number;
  isRealtime: boolean;
  isCancelled: boolean;
  platform: string | null;
  colors: {
    bg: string;
    text: string;
    border?: string;
  };
}

export interface TransitResponse {
  updatedAt: string;
  stationCount: number;
  departures: NormalizedDeparture[];
  byCategory: {
    trains: NormalizedDeparture[];
    busesAndTrams: NormalizedDeparture[];
  };
}
