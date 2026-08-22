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

<div class="dashboard-view flex flex-col gap-1.5">
  {#if weather}
    <!-- Current + Advisor -->
    <div class="grid grid-cols-12 gap-1.5 shrink-0">
      <div class="col-span-4 glass-card dashboard-card flex items-center justify-between">
        <div class="flex items-center space-x-2 min-w-0">
          <div class="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <Icon name={weather.current.weatherIcon} size={24} />
          </div>
          <div class="min-w-0">
            <div class="flex items-baseline space-x-1">
              <span class="text-xl font-extrabold text-white leading-none">{weather.current.temperature}°C</span>
              <span class="text-[10px] text-slate-400 font-mono">
                {i18n.t('weather.feelsLike', { temp: weather.current.apparentTemperature })}
              </span>
            </div>
            <p class="text-[10px] font-semibold text-slate-300 capitalize leading-tight">{currentWeatherLabel()}</p>
          </div>
        </div>

        <div class="text-right text-[10px] space-y-0.5 font-mono text-slate-400 shrink-0">
          <div class="flex items-center justify-end space-x-0.5">
            <Icon name="droplet" size={10} class="text-sky-400" />
            <span>{weather.current.relativeHumidity}%</span>
          </div>
          <div class="flex items-center justify-end space-x-0.5">
            <Icon name="wind" size={10} class="text-slate-400" />
            <span>{weather.current.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <div class="col-span-8 min-h-0">
        <WeatherBadge
          advisor={weather.advisor}
          apparentTemp={weather.current.apparentTemperature}
          currentTemp={weather.current.temperature}
          compact
        />
      </div>
    </div>

    <!-- Hourly forecast (horizontal scroll only) -->
    <div class="glass-card dashboard-card shrink-0 flex flex-col">
      <div class="flex items-center justify-between mb-1 shrink-0">
        <div class="flex items-center space-x-1.5">
          <Icon name="clock" size={13} class="text-sky-400" />
          <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {i18n.t('weather.hourlyForecastTitle')}
          </h3>
        </div>
        <span class="text-[9px] text-slate-500">{i18n.t('weather.swipeHint')}</span>
      </div>

      <div class="flex space-x-1.5 overflow-x-auto pb-0.5 select-none">
        {#each hourly as h, index}
          <div
            class="flex-shrink-0 w-14 py-1.5 px-1 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between gap-0.5 {
              index === 0 ? 'border-sky-500/40 bg-sky-950/20' : ''
            }"
          >
            <span class="text-[9px] font-mono font-semibold text-slate-400">
              {index === 0 ? i18n.t('weather.now') : h.hourFormatted}
            </span>
            <div class="text-sky-400">
              <Icon name={h.weatherIcon} size={18} />
            </div>
            <span class="text-[11px] font-bold text-white font-mono">{h.temperature}°</span>
            <div class="flex items-center space-x-0.5 text-[8px] font-mono {h.precipitationProbability >= 30 ? 'text-sky-400 font-bold' : 'text-slate-500'}">
              <Icon name="droplet" size={8} />
              <span>{h.precipitationProbability}%</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Weekly forecast fills remaining space -->
    <div class="glass-card dashboard-card flex-1 min-h-0 flex flex-col overflow-hidden">
      <div class="flex items-center space-x-1.5 mb-1 pb-0.5 border-b border-slate-800 shrink-0">
        <Icon name="sun" size={13} class="text-amber-400" />
        <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-300">
          {i18n.t('weather.weeklyTrendTitle')}
        </h3>
      </div>

      <div class="flex-1 min-h-0 grid grid-cols-2 gap-1 content-start overflow-hidden">
        {#each daily as d, index}
          <div
            class="px-1.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[10px] {
              index === 0 ? 'border-sky-500/30 bg-sky-950/20' : ''
            }"
          >
            <div class="w-14 shrink-0">
              <span class="font-bold text-white block leading-tight">
                {index === 0 ? i18n.t('weather.today') : i18n.formatWeekday(d.date, 'short')}
              </span>
              <span class="text-[8px] text-slate-400 block font-mono leading-tight">
                {i18n.formatDayAndMonth(d.date)}
              </span>
            </div>

            <div class="text-sky-400 px-0.5 shrink-0">
              <Icon name={d.weatherIcon} size={16} />
            </div>

            <div class="w-12 text-center shrink-0">
              {#if d.precipitationProbabilityMax >= 20}
                <span class="text-[8px] font-mono font-semibold text-sky-400 flex items-center justify-center space-x-0.5">
                  <Icon name="droplet" size={8} />
                  <span>{d.precipitationProbabilityMax}%</span>
                </span>
              {:else}
                <span class="text-[8px] text-slate-500 font-mono">{i18n.t('weather.dry')}</span>
              {/if}
            </div>

            <div class="text-right font-mono font-semibold shrink-0">
              <span class="text-white font-bold">{d.maxTemp}°</span>
              <span class="text-slate-500 ml-0.5 text-[9px]">{d.minTemp}°</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center text-slate-500">
      <div class="flex items-center space-x-2">
        <Icon name="refresh" size={18} class="animate-spin text-sky-400" />
        <span class="text-sm">{i18n.t('weather.loadingForecast')}</span>
      </div>
    </div>
  {/if}
</div>
