export type TransportProduct = 'U_BAHN' | 'S_BAHN' | 'TRAM' | 'BUS' | 'REGIONAL_BUS';

export interface StationConfig {
  id: string; // e.g. "de:09162:6" (Marienplatz) or "de:09162:2" (Sendlinger Tor)
  name: string;
  allowedProducts?: TransportProduct[];
  lines?: string[]; // e.g. ["U1", "U2", "16", "54"] - empty = all
  directions?: string[]; // destination filter - empty = all
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
