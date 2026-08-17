import { loadConfig } from '../config/config.loader.js';
import { StationConfig, TransportProduct } from '../types/config.types.js';
import {
  NormalizedDeparture,
  RawMvgDeparture,
  TransitCategory,
  TransitResponse,
} from '../types/mvg.types.js';

// Cache transit data for 10 seconds to prevent rapid redundant calls
let transitCache: { timestamp: number; data: TransitResponse } | null = null;
const CACHE_TTL_MS = 10_000;

export function getMvgLineColors(product: TransportProduct, label: string): { bg: string; text: string; border?: string } {
  const cleanLabel = label.trim().toUpperCase();

  // U-Bahn specific colors
  if (product === 'U_BAHN' || cleanLabel.startsWith('U')) {
    switch (cleanLabel) {
      case 'U1':
        return { bg: '#468444', text: '#ffffff' }; // Green
      case 'U2':
        return { bg: '#dd3b2b', text: '#ffffff' }; // Red
      case 'U3':
        return { bg: '#ef7c00', text: '#ffffff' }; // Orange
      case 'U4':
        return { bg: '#00ab84', text: '#ffffff' }; // Teal
      case 'U5':
        return { bg: '#b97017', text: '#ffffff' }; // Brown
      case 'U6':
        return { bg: '#0065ae', text: '#ffffff' }; // Blue
      case 'U7':
        return { bg: '#468444', text: '#ffffff', border: '#dd3b2b' }; // Green & Red
      case 'U8':
        return { bg: '#ef7c00', text: '#ffffff', border: '#dd3b2b' }; // Orange & Red
      default:
        return { bg: '#0065ae', text: '#ffffff' };
    }
  }

  // S-Bahn specific colors
  if (product === 'S_BAHN' || cleanLabel.startsWith('S')) {
    switch (cleanLabel) {
      case 'S1':
        return { bg: '#1ab3e8', text: '#ffffff' }; // Cyan
      case 'S2':
        return { bg: '#75bc42', text: '#ffffff' }; // Light Green
      case 'S3':
        return { bg: '#98288e', text: '#ffffff' }; // Purple
      case 'S4':
        return { bg: '#e30613', text: '#ffffff' }; // Red
      case 'S6':
        return { bg: '#008b53', text: '#ffffff' }; // Dark Green
      case 'S7':
        return { bg: '#943125', text: '#ffffff' }; // Brown
      case 'S8':
        return { bg: '#ffcc00', text: '#000000' }; // Yellow
      case 'S20':
        return { bg: '#ec6aa0', text: '#ffffff' }; // Pink
      default:
        return { bg: '#4fa83d', text: '#ffffff' }; // Default MVV S-Bahn Green
    }
  }

  // Tram
  if (product === 'TRAM' || cleanLabel.startsWith('N') && !isNaN(Number(cleanLabel.slice(1)))) {
    return { bg: '#d82020', text: '#ffffff' };
  }

  // Regional Bus
  if (product === 'REGIONAL_BUS') {
    return { bg: '#298539', text: '#ffffff' };
  }

  // City Bus / MetroBus
  return { bg: '#0d5c75', text: '#ffffff' };
}

export function normalizeTransportProduct(type: string): TransportProduct {
  const upper = (type || '').toUpperCase();
  if (upper.includes('U_BAHN') || upper === 'UBAHN' || upper === 'SUBWAY') return 'U_BAHN';
  if (upper.includes('S_BAHN') || upper === 'SBAHN' || upper === 'SUBURBAN') return 'S_BAHN';
  if (upper.includes('TRAM')) return 'TRAM';
  if (upper.includes('REGIONAL_BUS')) return 'REGIONAL_BUS';
  if (upper.includes('BUS')) return 'BUS';
  if (upper.includes('BAHN') || upper.includes('TRAIN') || upper.includes('REGIONAL_TRAIN')) return 'S_BAHN';
  return 'BUS';
}

export function getCategory(product: TransportProduct): TransitCategory {
  if (product === 'U_BAHN' || product === 'S_BAHN') {
    return 'TRAIN';
  }
  return 'BUS_TRAM';
}

async function fetchDeparturesForStation(station: StationConfig): Promise<NormalizedDeparture[]> {
  const url = `https://www.mvg.de/api/bgw-pt/v3/departures?globalId=${encodeURIComponent(station.id)}&limit=100&transportTypes=UBAHN,TRAM,SBAHN,BUS,REGIONAL_BUS,BAHN`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RaspberryPi-Dashboard/1.0)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`[MVG] Station ${station.name} (${station.id}) returned HTTP ${res.status}`);
      return [];
    }

    const rawList = (await res.json()) as RawMvgDeparture[];
    if (!Array.isArray(rawList)) {
      return [];
    }

    const now = Date.now();
    const normalizedList: NormalizedDeparture[] = [];

    for (const item of rawList) {
      const product = normalizeTransportProduct(item.transportType);
      const category = getCategory(product);
      const line = (item.label || '').trim();
      const destination = (item.destination || '').trim();

      // Product filter
      if (station.allowedProducts && station.allowedProducts.length > 0) {
        if (!station.allowedProducts.includes(product)) {
          continue;
        }
      }

      // Line filter
      if (station.lines && station.lines.length > 0) {
        const matchesLine = station.lines.some(
          (l) => l.toLowerCase() === line.toLowerCase() || l.toLowerCase() === product.toLowerCase()
        );
        if (!matchesLine) {
          continue;
        }
      }

      // Direction filter
      if (station.directions && station.directions.length > 0) {
        const matchesDirection = station.directions.some((d) =>
          destination.toLowerCase().includes(d.toLowerCase())
        );
        if (!matchesDirection) {
          continue;
        }
      }

      const plannedTime = item.plannedDepartureTime;
      const realtimeTime = item.realtimeDepartureTime || plannedTime;
      const isRealtime = Boolean(item.realtime ?? item.realtimeDepartureTime);
      const delayMinutes = Math.round((realtimeTime - plannedTime) / 60000);
      const departureInMinutes = Math.max(0, Math.round((realtimeTime - now) / 60000));
      const colors = getMvgLineColors(product, line);

      normalizedList.push({
        id: `${station.id}-${line}-${destination}-${plannedTime}`,
        stationId: station.id,
        stationName: station.name,
        line,
        destination,
        product,
        category,
        plannedTime,
        realtimeTime,
        delayMinutes,
        departureInMinutes,
        isRealtime,
        isCancelled: Boolean(item.cancelled),
        platform: item.platform != null ? String(item.platform) : null,
        colors,
      });
    }

    return normalizedList;
  } catch (error) {
    console.error(`[MVG] Failed to fetch station ${station.name} (${station.id}):`, error);
    return [];
  }
}

export async function fetchAllDepartures(): Promise<TransitResponse> {
  const config = loadConfig();
  const now = Date.now();

  if (transitCache && now - transitCache.timestamp < CACHE_TTL_MS) {
    return transitCache.data;
  }

  const stationPromises = config.transit.stations.map((station) =>
    fetchDeparturesForStation(station)
  );

  const resultsByStation = await Promise.allSettled(stationPromises);
  const allDepartures: NormalizedDeparture[] = [];

  for (const res of resultsByStation) {
    if (res.status === 'fulfilled') {
      allDepartures.push(...res.value);
    }
  }

  // Sort chronologically by real-time departure time
  allDepartures.sort((a, b) => a.realtimeTime - b.realtimeTime);

  // Group by category
  const trains = allDepartures.filter((d) => d.category === 'TRAIN');
  const busesAndTrams = allDepartures.filter((d) => d.category === 'BUS_TRAM');

  const response: TransitResponse = {
    updatedAt: new Date().toISOString(),
    stationCount: config.transit.stations.length,
    departures: allDepartures.slice(0, 50),
    byCategory: {
      trains: trains.slice(0, 30),
      busesAndTrams: busesAndTrams.slice(0, 30),
    },
  };

  transitCache = { timestamp: now, data: response };
  return response;
}
