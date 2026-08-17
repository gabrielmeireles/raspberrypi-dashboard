import fs from 'node:fs';
import path from 'node:path';
import { AppConfig } from '../types/config.types.js';

const DEFAULT_CONFIG: AppConfig = {
  weather: {
    city: 'München',
    latitude: 48.137154,
    longitude: 11.576124,
    timezone: 'Europe/Berlin',
  },
  transit: {
    stations: [
      {
        id: 'de:09162:6',
        name: 'Marienplatz',
        allowedProducts: ['U_BAHN', 'S_BAHN', 'BUS'],
        lines: [],
        directions: [],
      },
      {
        id: 'de:09162:2',
        name: 'Sendlinger Tor',
        allowedProducts: ['U_BAHN', 'TRAM', 'BUS'],
        lines: ['U1', 'U2', 'U3', 'U6', '16', '18', '27'],
        directions: [],
      },
      {
        id: 'de:09162:100',
        name: 'Hauptbahnhof',
        allowedProducts: ['U_BAHN', 'S_BAHN', 'TRAM', 'BUS'],
        lines: [],
        directions: [],
      },
    ],
    maxDeparturesPerStation: 20,
  },
  ui: {
    weatherPollIntervalMs: 300000,
    transitPollIntervalMs: 30000,
    configPollIntervalMs: 600000,
    theme: 'dark',
    locale: 'de-DE',
    timeFormat: '24h',
  },
};

let cachedConfig: AppConfig | null = null;
let lastLoadedTime = 0;

export function resolveConfigPath(): string {
  if (process.env.CONFIG_PATH) {
    return path.resolve(process.env.CONFIG_PATH);
  }

  // Check in current working directory, parent directory (root), or adjacent
  const candidatePaths = [
    path.resolve(process.cwd(), 'config.json'),
    path.resolve(process.cwd(), '..', 'config.json'),
    path.resolve(process.cwd(), 'config', 'config.json'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidatePaths[0];
}

export function loadConfig(forceReload = false): AppConfig {
  const now = Date.now();
  // Cache for 5 seconds unless forced
  if (cachedConfig && !forceReload && now - lastLoadedTime < 5000) {
    return cachedConfig;
  }

  const configPath = resolveConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(fileContent) as Partial<AppConfig>;

      cachedConfig = {
        weather: {
          ...DEFAULT_CONFIG.weather,
          ...(parsed.weather || {}),
        },
        transit: {
          ...DEFAULT_CONFIG.transit,
          ...(parsed.transit || {}),
          stations: parsed.transit?.stations && parsed.transit.stations.length > 0
            ? parsed.transit.stations
            : DEFAULT_CONFIG.transit.stations,
        },
        ui: {
          ...DEFAULT_CONFIG.ui,
          ...(parsed.ui || {}),
        },
      };

      lastLoadedTime = now;
      return cachedConfig;
    } else {
      console.warn(`[Config] Config file not found at ${configPath}. Using defaults.`);
      cachedConfig = DEFAULT_CONFIG;
      lastLoadedTime = now;
      return cachedConfig;
    }
  } catch (error) {
    console.error(`[Config] Error reading config at ${configPath}:`, error);
    if (!cachedConfig) {
      cachedConfig = DEFAULT_CONFIG;
    }
    return cachedConfig;
  }
}
