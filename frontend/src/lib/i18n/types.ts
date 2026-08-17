export type SupportedLocale = 'de' | 'en' | 'pt';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  intlLocale: string;
}

export interface Translations {
  nav: {
    home: string;
    weather: string;
    transit: string;
    lastUpdated: string;
    refresh: string;
    refreshTitle: string;
    language: string;
    changeLanguage: string;
  };
  home: {
    feelsLike: string;
    loadingWeather: string;
    nextTrains: string;
    nextBusesTrams: string;
    viewAll: string;
    noTrains: string;
    noBuses: string;
    platformShort: string;
    now: string;
    min: string;
  };
  transit: {
    trainsTitle: string;
    busesTramsTitle: string;
    departuresCount: string;
    cancelled: string;
    platform: string;
    now: string;
    min: string;
    noTrains: string;
    noBuses: string;
    allStations: string;
    filterStation: string;
  };
  weather: {
    feelsLike: string;
    hourlyForecastTitle: string;
    swipeHint: string;
    now: string;
    weeklyTrendTitle: string;
    today: string;
    dry: string;
    loadingForecast: string;
  };
  advisor: {
    clothingAdvice: string;
    wearJacket: string;
    noJacket: string;
    bringUmbrella: string;
    noUmbrella: string;
    levels: {
      STORM_ALERT: { badge: string; headline: string; detail: string };
      RAIN_ALERT_ACTIVE: { badge: string; headline: string; detail: string };
      RAIN_ALERT_FORECAST: { badge: string; headline: string; detail: string };
      FREEZING: { badge: string; headline: string; detail: string };
      HEAVY_JACKET: { badge: string; headline: string; detail: string };
      LIGHT_JACKET: { badge: string; headline: string; detail: string };
      EXTREME_HEAT: { badge: string; headline: string; detail: string };
      PERFECT_WEATHER: { badge: string; headline: string; detail: string };
    };
    recommendations: {
      jacketAndUmbrella: string;
      jacketOnly: string;
      umbrellaOnly: string;
      neither: string;
    };
  };
  weatherConditions: Record<number, { day: string; night?: string }>;
  common: {
    retry: string;
    weatherError: string;
    transitError: string;
  };
}
