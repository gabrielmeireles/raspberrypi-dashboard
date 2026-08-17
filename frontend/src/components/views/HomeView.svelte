<script lang="ts">
  import { i18n } from '../../lib/i18n/index.svelte.js';
  import { store } from '../../lib/store.svelte.js';
  import Clock from '../Clock.svelte';
  import Icon from '../Icon.svelte';
  import LinePill from '../LinePill.svelte';
  import WeatherBadge from '../WeatherBadge.svelte';
  import type { NormalizedDeparture } from '../../types/dashboard.types.js';

  const weather = $derived(store.weather);
  const advisor = $derived(store.weather?.advisor);
  const upcomingTrains = $derived(store.upcomingTrains());
  const upcomingBuses = $derived(store.upcomingBusesAndTrams());

  const weatherLabel = $derived(() => {
    if (!weather) return '';
    return i18n.getWeatherLabel(weather.current.weatherCode, weather.current.isDay);
  });

  function formatDepartureTime(dep: NormalizedDeparture): string {
    const time = dep.isRealtime ? dep.realtimeTime : dep.plannedTime;
    const d = new Date(time);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function formatRelativeTime(dep: NormalizedDeparture): { text: string; suffix: string } | null {
    if (dep.departureInMinutes <= 0) return null;
    if (dep.departureInMinutes >= 60) {
      const h = Math.floor(dep.departureInMinutes / 60);
      const m = dep.departureInMinutes % 60;
      return { text: `${h}h${m > 0 ? ` ${m}` : ''}`, suffix: m > 0 ? i18n.t('home.min') : '' };
    }
    return { text: `${dep.departureInMinutes}`, suffix: i18n.t('home.min') };
  }

  function getDepartureColorClass(dep: NormalizedDeparture): string {
    if (dep.isCancelled) {
      return 'text-red-400/80 line-through';
    }
    if (!dep.isRealtime) {
      return 'text-white font-semibold';
    }
    if (dep.delayMinutes > 0) {
      return 'text-rose-400 font-extrabold';
    }
    return `text-emerald-400 font-extrabold ${dep.departureInMinutes <= 2 ? 'animate-pulse' : ''}`;
  }
</script>

<div class="h-full w-full p-4 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto">
  <!-- Left Column: Clock, Current Weather & Advisor (5 cols) -->
  <div class="md:col-span-5 flex flex-col space-y-4">
    <!-- Clock Card -->
    <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
      <Clock city={weather?.city || 'München'} />
    </div>

    <!-- Weather & Advice Card -->
    {#if weather}
      <div class="glass-card rounded-2xl p-4 flex-1 flex flex-col justify-between space-y-3">
        <!-- Weather Overview Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Icon name={weather.current.weatherIcon} size={32} />
            </div>
            <div>
              <div class="flex items-baseline space-x-2">
                <span class="text-3xl font-extrabold text-white tracking-tight">
                  {weather.current.temperature}°C
                </span>
                <span class="text-xs text-slate-400 font-medium">
                  {i18n.t('home.feelsLike', { temp: weather.current.apparentTemperature })}
                </span>
              </div>
              <p class="text-xs font-semibold text-slate-300 capitalize">
                {weatherLabel()}
              </p>
            </div>
          </div>

          <!-- Humidity & Wind quick stats -->
          <div class="text-right text-xs space-y-1 text-slate-400 font-mono">
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

        <!-- Advisor Badge Component -->
        {#if advisor}
          <WeatherBadge
            advisor={advisor}
            apparentTemp={weather.current.apparentTemperature}
            currentTemp={weather.current.temperature}
          />
        {/if}
      </div>
    {:else}
      <div class="glass-card rounded-2xl p-6 flex-1 flex items-center justify-center text-slate-500">
        <div class="flex items-center space-x-2">
          <Icon name="refresh" size={18} class="animate-spin text-sky-400" />
          <span class="text-sm">{i18n.t('home.loadingWeather')}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Right Column: Next Departures Summary (7 cols) -->
  <div class="md:col-span-7 flex flex-col space-y-4">
    <!-- Next Trains Section -->
    <div class="glass-card rounded-2xl p-4 flex-1 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <Icon name="train" size={18} class="text-emerald-400" />
          <h2 class="text-sm font-bold text-slate-200 tracking-wide uppercase">{i18n.t('home.nextTrains')}</h2>
        </div>
        <button
          onclick={() => store.setTab('transit')}
          class="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
        >
          <span>{i18n.t('home.viewAll')}</span>
          <span>→</span>
        </button>
      </div>

      {#if upcomingTrains.length > 0}
        <div class="space-y-2 flex-1 flex flex-col justify-around">
          {#each upcomingTrains as dep (dep.id)}
            <div class="flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-colors {
              dep.isCancelled
                ? 'bg-red-950/20 border border-red-500/30 opacity-60'
                : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
            }">
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <LinePill line={dep.line} product={dep.product} colors={dep.colors} size="sm" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-1.5">
                    <p class="text-sm font-semibold truncate leading-tight {dep.isCancelled ? 'line-through text-slate-400' : 'text-white'}">
                      {dep.destination}
                    </p>
                    {#if dep.isCancelled}
                      <span class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                        {i18n.t('transit.cancelled')}
                      </span>
                    {/if}
                  </div>
                  <p class="text-[11px] text-slate-400 truncate flex items-center space-x-1.5">
                    <span>{dep.stationName}</span>
                    {#if dep.platform}
                      <span class="text-slate-500">• {i18n.t('home.platformShort', { platform: dep.platform })}</span>
                    {/if}
                  </p>
                </div>
              </div>

              <!-- Departure time & status -->
              <div class="flex items-center space-x-2 pl-3 text-right shrink-0">
                {#if dep.isRealtime && dep.delayMinutes > 0 && !dep.isCancelled}
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    +{dep.delayMinutes}'
                  </span>
                {/if}
                <div class="flex flex-col items-end {getDepartureColorClass(dep)}">
                  <span class="font-mono text-sm leading-tight">{formatDepartureTime(dep)}</span>
                  <span class="font-mono text-[10px] opacity-70 leading-tight">
                    {#if dep.departureInMinutes <= 0}
                      {i18n.t('home.now')}
                    {:else}
                      {@const rel = formatRelativeTime(dep)}
                      {#if rel}
                        {rel.text}{#if rel.suffix}&nbsp;<span class="font-normal">{rel.suffix}</span>{/if}
                      {/if}
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex-1 flex items-center justify-center text-slate-500 text-xs py-4">
          {i18n.t('home.noTrains')}
        </div>
      {/if}
    </div>

    <!-- Next Buses / Trams Section -->
    <div class="glass-card rounded-2xl p-4 flex-1 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <Icon name="bus" size={18} class="text-sky-400" />
          <h2 class="text-sm font-bold text-slate-200 tracking-wide uppercase">{i18n.t('home.nextBusesTrams')}</h2>
        </div>
        <button
          onclick={() => store.setTab('transit')}
          class="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
        >
          <span>{i18n.t('home.viewAll')}</span>
          <span>→</span>
        </button>
      </div>

      {#if upcomingBuses.length > 0}
        <div class="space-y-2 flex-1 flex flex-col justify-around">
          {#each upcomingBuses as dep (dep.id)}
            <div class="flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-colors {
              dep.isCancelled
                ? 'bg-red-950/20 border border-red-500/30 opacity-60'
                : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
            }">
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <LinePill line={dep.line} product={dep.product} colors={dep.colors} size="sm" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-1.5">
                    <p class="text-sm font-semibold truncate leading-tight {dep.isCancelled ? 'line-through text-slate-400' : 'text-white'}">
                      {dep.destination}
                    </p>
                    {#if dep.isCancelled}
                      <span class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                        {i18n.t('transit.cancelled')}
                      </span>
                    {/if}
                  </div>
                  <p class="text-[11px] text-slate-400 truncate">
                    {dep.stationName}
                  </p>
                </div>
              </div>

              <!-- Departure time & status -->
              <div class="flex items-center space-x-2 pl-3 text-right shrink-0">
                {#if dep.isRealtime && dep.delayMinutes > 0 && !dep.isCancelled}
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    +{dep.delayMinutes}'
                  </span>
                {/if}
                <div class="flex flex-col items-end {getDepartureColorClass(dep)}">
                  <span class="font-mono text-sm leading-tight">{formatDepartureTime(dep)}</span>
                  <span class="font-mono text-[10px] opacity-70 leading-tight">
                    {#if dep.departureInMinutes <= 0}
                      {i18n.t('home.now')}
                    {:else}
                      {@const rel = formatRelativeTime(dep)}
                      {#if rel}
                        {rel.text}{#if rel.suffix}&nbsp;<span class="font-normal">{rel.suffix}</span>{/if}
                      {/if}
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex-1 flex items-center justify-center text-slate-500 text-xs py-4">
          {i18n.t('home.noBuses')}
        </div>
      {/if}
    </div>
  </div>
</div>
