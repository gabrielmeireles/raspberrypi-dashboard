import { AdvisoryLevel, WeatherAdvisor } from '../types/weather.types.js';

interface AdvisorInput {
  currentTemp: number;
  apparentTemp: number;
  currentPrecipitation: number;
  currentRain: number;
  weatherCode: number;
  nextHoursPrecipProbMax: number;
  nextHoursPrecipSum: number;
}

export function computeWeatherAdvice(input: AdvisorInput): WeatherAdvisor {
  const {
    currentTemp,
    apparentTemp,
    currentPrecipitation,
    currentRain,
    weatherCode,
    nextHoursPrecipProbMax,
    nextHoursPrecipSum,
  } = input;

  // Rain weather codes (WMO: 51-67 drizzle/rain/freezing rain, 80-82 showers, 95-99 thunderstorm)
  const isRainCode = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isStormCode = weatherCode >= 95 && weatherCode <= 99;
  const isSnowCode = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);

  // Umbrella needed if raining now, storming, or >40% chance of rain in the near forecast
  const bringUmbrella =
    currentRain > 0.05 ||
    currentPrecipitation > 0.1 ||
    isRainCode ||
    isStormCode ||
    nextHoursPrecipProbMax >= 40 ||
    nextHoursPrecipSum >= 0.5;

  // Jacket needed if apparent temp < 17°C or ambient temp < 16°C
  const wearJacket = apparentTemp < 17 || currentTemp < 16 || isSnowCode;

  // Determine advisory level
  let advisoryLevel: AdvisoryLevel = 'PERFECT_WEATHER';
  let badgeTone: WeatherAdvisor['badgeTone'] = 'neutral';
  let badgeText = 'Angenehm';
  let headline = 'T-Shirt & Pullover Wetter';
  const details: string[] = [];

  if (isStormCode) {
    advisoryLevel = 'STORM_ALERT';
    badgeTone = 'alert';
    badgeText = 'Gewitterwarnung';
    headline = 'Gewitter möglich – Vorsicht!';
    details.push('Starke Regenfälle & Blitzschlaggefahr möglich.');
  } else if (bringUmbrella && (isRainCode || currentRain > 0.1)) {
    advisoryLevel = 'RAIN_ALERT';
    badgeTone = 'alert';
    badgeText = 'Regenschirm!';
    headline = 'Es regnet – Schirm einpacken!';
    details.push(`Aktuell Niederschlag gemeldet (${currentPrecipitation.toFixed(1)} mm).`);
  } else if (bringUmbrella) {
    advisoryLevel = 'RAIN_ALERT';
    badgeTone = 'warning';
    badgeText = 'Regengefahr';
    headline = 'Regenschirm empfohlen';
    details.push(`${nextHoursPrecipProbMax}% Regenwahrscheinlichkeit in den nächsten Stunden.`);
  } else if (apparentTemp <= 3 || isSnowCode) {
    advisoryLevel = 'FREEZING';
    badgeTone = 'alert';
    badgeText = 'Winterjacke!';
    headline = 'Eisige Kälte – Dick einpacken!';
    details.push(`Gefühlte Temperatur bei ${apparentTemp.toFixed(1)}°C.`);
  } else if (apparentTemp < 12) {
    advisoryLevel = 'HEAVY_JACKET';
    badgeTone = 'warning';
    badgeText = 'Warme Jacke';
    headline = 'Warme Jacke anziehen';
    details.push(`Frisch mit gefühlten ${apparentTemp.toFixed(1)}°C.`);
  } else if (apparentTemp < 17) {
    advisoryLevel = 'LIGHT_JACKET';
    badgeTone = 'info';
    badgeText = 'Leichte Jacke';
    headline = 'Leichte Jacke oder Übergangsjacke';
    details.push(`Mild bei gefühlten ${apparentTemp.toFixed(1)}°C.`);
  } else if (currentTemp >= 28 || apparentTemp >= 30) {
    advisoryLevel = 'EXTREME_HEAT';
    badgeTone = 'alert';
    badgeText = 'Hitze';
    headline = 'Sehr warm – Ausreichend trinken!';
    details.push(`Heiße ${currentTemp.toFixed(1)}°C im Schatten.`);
  } else {
    advisoryLevel = 'PERFECT_WEATHER';
    badgeTone = 'success';
    badgeText = 'Keine Jacke';
    headline = 'Angenehme Temperaturen';
    details.push(`Schöne ${currentTemp.toFixed(1)}°C ohne Niederschlag.`);
  }

  // Summary recommendation
  if (wearJacket && bringUmbrella) {
    details.push('Jacke + Schirm mitnehmen.');
  } else if (wearJacket) {
    details.push('Jacke empfohlen, kein Schirm nötig.');
  } else if (bringUmbrella) {
    details.push('Schirm einpacken, Jacke optional.');
  } else {
    details.push('Keine Jacke und kein Regenschirm notwendig.');
  }

  return {
    wearJacket,
    bringUmbrella,
    advisoryLevel,
    badgeText,
    badgeTone,
    headline,
    details,
  };
}
