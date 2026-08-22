<script lang="ts">
  import { i18n } from '../../lib/i18n/index.svelte.js';
  import { store } from '../../lib/store.svelte.js';
  import Clock from '../Clock.svelte';
  import Icon from '../Icon.svelte';
  import LinePill from '../LinePill.svelte';
  import WeatherBadge from '../WeatherBadge.svelte';
  import type { NormalizedDeparture } from '../../types/dashboard.types.js';
    import methods from '../../utils/methods.js';

  const weather = $derived(store.weather);
  const advisor = $derived(store.weather?.advisor);
  const upcomingTrains = $derived(store.upcomingTrains());
  const upcomingBuses = $derived(store.upcomingBusesAndTrams());

  const weatherLabel = $derived(() => {
    if (!weather) return '';
    return i18n.getWeatherLabel(weather.current.weatherCode, weather.current.isDay);
  });
</script>

{#snippet departureRow(dep: NormalizedDeparture)}
  <div
    class="departure-row flex items-center justify-between transition-colors {
      dep.isCancelled
        ? 'bg-red-950/20 border border-red-500/30 opacity-60'
        : 'bg-slate-900/60 border border-slate-800/80'
    }"
  >
    <div class="flex items-center space-x-2 min-w-0 flex-1">
      <LinePill line={dep.line} product={dep.product} colors={dep.colors} size="sm" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center space-x-1">
          <p class="text-[11px] font-semibold truncate leading-tight {dep.isCancelled ? 'line-through text-slate-400' : 'text-white'}">
            {dep.destination}
          </p>
          {#if dep.isCancelled}
            <span class="text-[8px] uppercase font-bold px-1 py-0 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              {i18n.t('transit.cancelled')}
            </span>
          {/if}
        </div>
        <p class="text-[9px] text-slate-400 truncate leading-tight">
          <span>{dep.stationName}</span>
          {#if dep.platform}
            <span class="text-slate-500"> • {i18n.t('home.platformShort', { platform: dep.platform })}</span>
          {/if}
        </p>
      </div>
    </div>

    <div class="flex items-center space-x-1 pl-2 text-right shrink-0">
      {#if dep.isRealtime && dep.delayMinutes > 0 && !dep.isCancelled}
        <span class="text-[9px] font-bold px-1 py-0 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
          +{dep.delayMinutes}'
        </span>
      {/if}
      <div class="flex flex-col items-end {methods.getDepartureColorClass(dep)}">
        <span class="font-mono text-[11px] leading-none">{methods.formatDepartureTime(dep)}</span>
        <span class="font-mono text-[9px] opacity-70 leading-none mt-0.5">
          {#if dep.departureInMinutes <= 0}
            {i18n.t('home.now')}
          {:else}
            {@const rel = methods.formatRelativeTime(dep)}
            {#if rel}
              {rel.text}{#if rel.suffix}&nbsp;<span class="font-normal">{rel.suffix}</span>{/if}
            {/if}
          {/if}
        </span>
      </div>
    </div>
  </div>
{/snippet}

<div class="dashboard-view grid grid-cols-12 gap-1.5">
  <!-- Left: Clock + Weather -->
  <div class="col-span-5 flex flex-col gap-1.5 min-h-0 h-full overflow-hidden">
    <div class="glass-card dashboard-card shrink-0">
      <Clock city={weather?.city || 'München'} />
    </div>

    {#if weather}
      <div class="glass-card dashboard-card flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
        <div class="flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-2 min-w-0">
            <div class="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <Icon name={weather.current.weatherIcon} size={22} />
            </div>
            <div class="min-w-0">
              <div class="flex items-baseline space-x-1.5">
                <span class="text-xl font-extrabold text-white tracking-tight leading-none">
                  {weather.current.temperature}°C
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  {i18n.t('home.feelsLike', { temp: weather.current.apparentTemperature })}
                </span>
              </div>
              <p class="text-[10px] font-semibold text-slate-300 capitalize leading-tight">
                {weatherLabel()}
              </p>
            </div>
          </div>

          <div class="text-right text-[10px] space-y-0.5 text-slate-400 font-mono shrink-0">
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

        {#if advisor}
          <div class="flex-1 min-h-0 overflow-hidden">
            <WeatherBadge
              advisor={advisor}
              apparentTemp={weather.current.apparentTemperature}
              currentTemp={weather.current.temperature}
              compact
            />
          </div>
        {/if}
      </div>
    {:else}
      <div class="glass-card dashboard-card flex-1 flex items-center justify-center text-slate-500">
        <div class="flex items-center space-x-2">
          <Icon name="refresh" size={16} class="animate-spin text-sky-400" />
          <span class="text-xs">{i18n.t('home.loadingWeather')}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Right: Departures -->
  <div class="col-span-7 flex flex-col gap-1.5 min-h-0 h-full overflow-hidden">
    <div class="glass-card dashboard-card flex-1 min-h-0 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 shrink-0">
        <div class="flex items-center space-x-1.5">
          <Icon name="train" size={14} class="text-emerald-400" />
          <h2 class="text-[10px] font-bold text-slate-200 tracking-wide uppercase">{i18n.t('home.nextTrains')}</h2>
        </div>
        <button
          onclick={() => store.setTab('transit')}
          class="text-[10px] text-sky-400 hover:text-sky-300 font-medium"
        >
          {i18n.t('home.viewAll')} →
        </button>
      </div>

      {#if upcomingTrains.length > 0}
        <div class="flex-1 min-h-0 flex flex-col justify-between gap-0.5">
          {#each upcomingTrains as dep (dep.id)}
            {@render departureRow(dep)}
          {/each}
        </div>
      {:else}
        <div class="flex-1 flex items-center justify-center text-slate-500 text-[10px]">
          {i18n.t('home.noTrains')}
        </div>
      {/if}
    </div>

    <div class="glass-card dashboard-card flex-1 min-h-0 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 shrink-0">
        <div class="flex items-center space-x-1.5">
          <Icon name="bus" size={14} class="text-sky-400" />
          <h2 class="text-[10px] font-bold text-slate-200 tracking-wide uppercase">{i18n.t('home.nextBusesTrams')}</h2>
        </div>
        <button
          onclick={() => store.setTab('transit')}
          class="text-[10px] text-sky-400 hover:text-sky-300 font-medium"
        >
          {i18n.t('home.viewAll')} →
        </button>
      </div>

      {#if upcomingBuses.length > 0}
        <div class="flex-1 min-h-0 flex flex-col justify-between gap-0.5">
          {#each upcomingBuses as dep (dep.id)}
            {@render departureRow(dep)}
          {/each}
        </div>
      {:else}
        <div class="flex-1 flex items-center justify-center text-slate-500 text-[10px]">
          {i18n.t('home.noBuses')}
        </div>
      {/if}
    </div>
  </div>
</div>
