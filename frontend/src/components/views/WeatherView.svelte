<script lang="ts">
  import { i18n } from '../../lib/i18n/index.svelte.js';
  import { store } from '../../lib/store.svelte.js';
  import Icon from '../Icon.svelte';
  import WeatherBadge from '../WeatherBadge.svelte';

  const weather = $derived(store.weather);
  const hourly = $derived(store.weather?.hourly || []);
  const daily = $derived(store.weather?.daily || []);

  const currentWeatherLabel = $derived(() => {
    if (!weather) return '';
    return i18n.getWeatherLabel(weather.current.weatherCode, weather.current.isDay);
  });
</script>

<div class="h-full w-full p-4 flex flex-col space-y-4 overflow-y-auto">
  {#if weather}
    <!-- Top Header Summary & Advisory Bar -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
      <!-- Current Status Card (4 cols) -->
      <div class="md:col-span-4 glass-card rounded-2xl p-3.5 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Icon name={weather.current.weatherIcon} size={36} />
          </div>
          <div>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-3xl font-extrabold text-white">{weather.current.temperature}°C</span>
              <span class="text-xs text-slate-400 font-mono">
                {i18n.t('weather.feelsLike', { temp: weather.current.apparentTemperature })}
              </span>
            </div>
            <p class="text-xs font-semibold text-slate-300 capitalize">{currentWeatherLabel()}</p>
          </div>
        </div>

        <div class="text-right text-xs space-y-1 font-mono text-slate-400">
          <div class="flex items-center justify-end space-x-1">
            <Icon name="droplet" size={12} class="text-sky-400" />
            <span>{weather.current.relativeHumidity}%</span>
          </div>
          <div class="flex items-center justify-end space-x-1">
            <Icon name="wind" size={12} class="text-slate-400" />
            <span>{weather.current.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <!-- Advisor Card (8 cols) -->
      <div class="md:col-span-8">
        <WeatherBadge
          advisor={weather.advisor}
          apparentTemp={weather.current.apparentTemperature}
          currentTemp={weather.current.temperature}
        />
      </div>
    </div>

    <!-- 24-Hour Hourly Forecast (Horizontal Carousel/Scroll) -->
    <div class="glass-card rounded-2xl p-3.5 flex flex-col">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <Icon name="clock" size={16} class="text-sky-400" />
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">
            {i18n.t('weather.hourlyForecastTitle')}
          </h3>
        </div>
        <span class="text-[11px] text-slate-400 font-medium">{i18n.t('weather.swipeHint')}</span>
      </div>

      <div class="flex space-x-2.5 overflow-x-auto pb-2 pt-1 -mx-1 px-1 select-none">
        {#each hourly as h, index}
          <div
            class="flex-shrink-0 w-20 py-2.5 px-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between space-y-1.5 transition-transform hover:scale-105 {
              index === 0 ? 'border-sky-500/40 bg-sky-950/20' : ''
            }"
          >
            <!-- Hour -->
            <span class="text-xs font-mono font-semibold text-slate-400">
              {index === 0 ? i18n.t('weather.now') : h.hourFormatted}
            </span>

            <!-- Weather Icon -->
            <div class="text-sky-400 my-0.5">
              <Icon name={h.weatherIcon} size={24} />
            </div>

            <!-- Temperature -->
            <span class="text-sm font-bold text-white font-mono">{h.temperature}°</span>

            <!-- Precipitation Probability -->
            <div class="flex items-center space-x-0.5 text-[10px] font-mono {h.precipitationProbability >= 30 ? 'text-sky-400 font-bold' : 'text-slate-500'}">
              <Icon name="droplet" size={10} />
              <span>{h.precipitationProbability}%</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 14-Day Weekly Forecast Layout -->
    <div class="glass-card rounded-2xl p-3.5 flex-1 flex flex-col">
      <div class="flex items-center space-x-2 mb-2 pb-1 border-b border-slate-800">
        <Icon name="sun" size={16} class="text-amber-400" />
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">
          {i18n.t('weather.weeklyTrendTitle')}
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto">
        {#each daily as d, index}
          <div
            class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs {
              index === 0 ? 'border-sky-500/30 bg-sky-950/20' : ''
            }"
          >
            <!-- Day & Date -->
            <div class="w-20">
              <span class="font-bold text-white block">
                {index === 0 ? i18n.t('weather.today') : i18n.formatWeekday(d.date, 'short')}
              </span>
              <span class="text-[10px] text-slate-400 block font-mono">
                {i18n.formatDayAndMonth(d.date)}
              </span>
            </div>

            <!-- Weather Icon -->
            <div class="text-sky-400 px-1">
              <Icon name={d.weatherIcon} size={22} />
            </div>

            <!-- Rain chance & Sun -->
            <div class="w-16 text-center">
              {#if d.precipitationProbabilityMax >= 20}
                <span class="text-[10px] font-mono font-semibold text-sky-400 flex items-center justify-center space-x-0.5">
                  <Icon name="droplet" size={10} />
                  <span>{d.precipitationProbabilityMax}%</span>
                </span>
                {#if d.precipitationSum > 0}
                  <span class="text-[9px] text-slate-400 font-mono block">{d.precipitationSum}mm</span>
                {/if}
              {:else}
                <span class="text-[10px] text-slate-500 font-mono">{i18n.t('weather.dry')}</span>
              {/if}
            </div>

            <!-- Min/Max Temp -->
            <div class="text-right font-mono font-semibold min-w-[3.5rem]">
              <span class="text-white font-bold">{d.maxTemp}°</span>
              <span class="text-slate-500 ml-1 text-[11px]">{d.minTemp}°</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center text-slate-500">
      <div class="flex items-center space-x-2">
        <Icon name="refresh" size={20} class="animate-spin text-sky-400" />
        <span>{i18n.t('weather.loadingForecast')}</span>
      </div>
    </div>
  {/if}
</div>
