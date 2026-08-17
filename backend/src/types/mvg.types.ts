import { TransportProduct } from './config.types.js';

export interface RawMvgDeparture {
  plannedDepartureTime: number;
  realtimeDepartureTime?: number;
  realtime?: boolean;
  delayInMinutes?: number;
  transportType: string;
  label: string;
  destination: string;
  cancelled?: boolean;
  sev?: boolean;
  platform?: number | string;
  messages?: string[];
  bannerHash?: string;
  occupancy?: string;
  stopPointGlobalId?: string;
}

export type TransitCategory = 'TRAIN' | 'BUS_TRAM';

export interface NormalizedDeparture {
  id: string;
  stationId: string;
  stationName: string;
  line: string;
  destination: string;
  product: TransportProduct;
  category: TransitCategory;
  plannedTime: number; // epoch ms
  realtimeTime: number; // epoch ms
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
