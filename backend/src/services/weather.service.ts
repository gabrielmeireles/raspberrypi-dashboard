import { loadConfig } from '../config/config.loader.js';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherResponse,
} from '../types/weather.types.js';
import { computeWeatherAdvice } from './advisor.service.js';

// Cache weather responses for 2 minutes to minimize network traffic
let weatherCache: { timestamp: number; data: WeatherResponse } | null = null;
const CACHE_TTL_MS = 120_000;

export function mapWmoCode(code: number, isDay: boolean = true): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: isDay ? 'Klar / Sonnig' : 'Klar', icon: isDay ? 'sun' : 'moon' };
    case 1:
      return { label: isDay ? 'Überwiegend sonnig' : 'Klar', icon: isDay ? 'sun' : 'moon' };
    case 2:
      return { label: 'Teilweise bewölkt', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
    case 3:
      return { label: 'Bedeckt', icon: 'cloud' };
    case 45:
    case 48:
      return { label: 'Nebel', icon: 'cloud-fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Leichter Nieselregen', icon: 'cloud-drizzle' };
    case 56:
    case 57:
      return { label: 'Gefrierender Nieselregen', icon: 'cloud-snow' };
    case 61:
      return { label: 'Leichter Regen', icon: 'cloud-rain' };
    case 63:
      return { label: 'Mäßiger Regen', icon: 'cloud-rain' };
    case 65:
      return { label: 'Starker Regen', icon: 'cloud-rain-heavy' };
    case 66:
    case 67:
      return { label: 'Gefrierender Regen', icon: 'cloud-snow' };
    case 71:
      return { label: 'Leichter Schneefall', icon: 'snowflake' };
    case 73:
      return { label: 'Schneefall', icon: 'snowflake' };
    case 75:
      return { label: 'Starker Schneefall', icon: 'snowflake' };
    case 77:
      return { label: 'Schneegriesel', icon: 'snowflake' };
    case 80:
      return { label: 'Leichte Regenschauer', icon: 'cloud-rain' };
    case 81:
      return { label: 'Regenschauer', icon: 'cloud-rain' };
    case 82:
      return { label: 'Heftige Schauer', icon: 'cloud-rain-heavy' };
    case 85:
    case 86:
      return { label: 'Schneeschauer', icon: 'snowflake' };
    case 95:
      return { label: 'Gewitter', icon: 'cloud-lightning' };
    case 96:
    case 99:
      return { label: 'Gewitter mit Hagel', icon: 'cloud-lightning' };
    default:
      return { label: 'Bewölkt', icon: 'cloud' };
  }
}

const GERMAN_DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const GERMAN_MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
];

export async function fetchWeatherData(): Promise<WeatherResponse> {
  const config = loadConfig();
  const now = Date.now();

  if (weatherCache && now - weatherCache.timestamp < CACHE_TTL_MS) {
    return weatherCache.data;
  }

  const { latitude, longitude, timezone, city } = config.weather;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,is_day'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max'
  );
  url.searchParams.set('forecast_days', '14');
  url.searchParams.set('timezone', timezone || 'auto');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'RaspberryPi-Dashboard/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}: ${res.statusText}`);
    }

    const json = await res.json() as any;

    const currentRaw = json.current;
    const isDay = Boolean(currentRaw.is_day);
    const { label: weatherLabel, icon: weatherIcon } = mapWmoCode(currentRaw.weather_code, isDay);

    const current: CurrentWeather = {
      time: currentRaw.time,
      temperature: Math.round(currentRaw.temperature_2m * 10) / 10,
      apparentTemperature: Math.round(currentRaw.apparent_temperature * 10) / 10,
      relativeHumidity: currentRaw.relative_humidity_2m,
      windSpeed: Math.round(currentRaw.wind_speed_10m * 10) / 10,
      precipitation: currentRaw.precipitation,
      rain: currentRaw.rain,
      weatherCode: currentRaw.weather_code,
      weatherLabel,
      weatherIcon,
      isDay,
    };

    // Parse next 24 hourly steps
    const hourlyTimes: string[] = json.hourly.time || [];
    const currentIsoPrefix = currentRaw.time.slice(0, 13); // e.g. "2026-08-17T23"
    let startIndex = hourlyTimes.findIndex((t) => t.startsWith(currentIsoPrefix));
    if (startIndex === -1) startIndex = 0;

    const hourly: HourlyForecast[] = [];
    const next6HoursPrecipProbs: number[] = [];
    let next6HoursPrecipSum = 0;

    for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
      const timeStr = hourlyTimes[i];
      const hourDate = new Date(timeStr);
      const hourFormatted = `${hourDate.getHours().toString().padStart(2, '0')}:00`;
      const hIsDay = Boolean(json.hourly.is_day?.[i]);
      const wCode = json.hourly.weather_code?.[i] ?? 0;
      const { icon: hIcon } = mapWmoCode(wCode, hIsDay);
      const precipProb = json.hourly.precipitation_probability?.[i] ?? 0;
      const precip = json.hourly.precipitation?.[i] ?? 0;

      if (i < startIndex + 6) {
        next6HoursPrecipProbs.push(precipProb);
        next6HoursPrecipSum += precip;
      }

      hourly.push({
        time: timeStr,
        hourFormatted,
        temperature: Math.round(json.hourly.temperature_2m[i] * 10) / 10,
        apparentTemperature: Math.round(json.hourly.apparent_temperature[i] * 10) / 10,
        precipitationProbability: precipProb,
        precipitation: precip,
        weatherCode: wCode,
        weatherIcon: hIcon,
        isDay: hIsDay,
      });
    }

    // Parse daily forecast (up to 14 days)
    const daily: DailyForecast[] = [];
    const dailyTimes: string[] = json.daily?.time || [];

    for (let i = 0; i < dailyTimes.length; i++) {
      const dStr = dailyTimes[i];
      const dDate = new Date(dStr);
      const dayName = GERMAN_DAY_NAMES[dDate.getDay()];
      const formattedDate = `${dDate.getDate()}. ${GERMAN_MONTH_NAMES[dDate.getMonth()]}`;
      const dCode = json.daily.weather_code[i];
      const { icon: dIcon } = mapWmoCode(dCode, true);

      daily.push({
        date: dStr,
        dayName,
        formattedDate,
        minTemp: Math.round(json.daily.temperature_2m_min[i]),
        maxTemp: Math.round(json.daily.temperature_2m_max[i]),
        minApparentTemp: Math.round(json.daily.apparent_temperature_min[i]),
        maxApparentTemp: Math.round(json.daily.apparent_temperature_max[i]),
        precipitationProbabilityMax: json.daily.precipitation_probability_max[i] ?? 0,
        precipitationSum: Math.round((json.daily.precipitation_sum[i] ?? 0) * 10) / 10,
        weatherCode: dCode,
        weatherIcon: dIcon,
        sunrise: json.daily.sunrise[i]?.slice(11, 16) || '',
        sunset: json.daily.sunset[i]?.slice(11, 16) || '',
      });
    }

    // Compute jacket & umbrella advice
    const maxNextPrecipProb = next6HoursPrecipProbs.length > 0 ? Math.max(...next6HoursPrecipProbs) : 0;
    const advisor = computeWeatherAdvice({
      currentTemp: current.temperature,
      apparentTemp: current.apparentTemperature,
      currentPrecipitation: current.precipitation,
      currentRain: current.rain,
      weatherCode: current.weatherCode,
      nextHoursPrecipProbMax: maxNextPrecipProb,
      nextHoursPrecipSum: next6HoursPrecipSum,
    });

    const response: WeatherResponse = {
      city,
      latitude,
      longitude,
      timezone,
      updatedAt: new Date().toISOString(),
      current,
      advisor,
      hourly,
      daily,
    };

    weatherCache = { timestamp: now, data: response };
    return response;
  } catch (error) {
    console.error('[WeatherService] Error fetching weather:', error);
    if (weatherCache) {
      console.warn('[WeatherService] Returning stale cached weather data.');
      return weatherCache.data;
    }
    throw error;
  }
}
