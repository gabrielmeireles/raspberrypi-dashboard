<script lang="ts">
  import { i18n } from '../../lib/i18n/index.svelte.js';
  import { store } from '../../lib/store.svelte.js';
  import Icon from '../Icon.svelte';
  import LinePill from '../LinePill.svelte';
  import type { NormalizedDeparture } from '../../types/dashboard.types.js';

  let selectedStationId = $state<string>('all');

  const allDepartures = $derived(store.transit?.departures || []);

  const stationOptions = $derived(() => {
    const configured = store.config?.transit.stations || [];
    const departures = allDepartures;

    const stationMap = new Map<string, string>();

    // Add configured stations in configured order
    for (const st of configured) {
      stationMap.set(st.id, st.name);
    }

    // Add any stations found in departures not already present
    for (const dep of departures) {
      if (dep.stationId && !stationMap.has(dep.stationId)) {
        stationMap.set(dep.stationId, dep.stationName);
      }
    }

    return Array.from(stationMap.entries()).map(([id, name]) => {
      const count = departures.filter(
        (d) => d.stationId === id || d.stationName === name
      ).length;
      return { id, name, count };
    });
  });

  const filteredTrains = $derived(() => {
    const trains = store.transit?.byCategory.trains || [];
    if (selectedStationId === 'all') return trains;
    return trains.filter(
      (dep) =>
        dep.stationId === selectedStationId ||
        dep.stationName === selectedStationId
    );
  });

  const filteredBusesAndTrams = $derived(() => {
    const buses = store.transit?.byCategory.busesAndTrams || [];
    if (selectedStationId === 'all') return buses;
    return buses.filter(
      (dep) =>
        dep.stationId === selectedStationId ||
        dep.stationName === selectedStationId
    );
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
      return { text: `${h}h${m > 0 ? ` ${m}` : ''}`, suffix: m > 0 ? i18n.t('transit.min') : '' };
    }
    return { text: `${dep.departureInMinutes}`, suffix: i18n.t('transit.min') };
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

<div class="h-full w-full p-4 flex flex-col overflow-hidden space-y-3">
  <!-- Top Station Filter Bar -->
  <div class="glass-card rounded-2xl px-3.5 py-2.5 flex items-center space-x-3 shrink-0 shadow-lg shadow-black/20 border border-slate-800/80">
    <div class="flex items-center space-x-2 text-xs font-bold text-slate-300 shrink-0">
      <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
        <Icon name="map-pin" size={15} />
      </div>
      <span class="hidden sm:inline uppercase tracking-wider text-[11px] text-slate-400">
        {i18n.t('transit.filterStation')}:
      </span>
    </div>

    <!-- Station Selection Filter Pills -->
    <div class="flex items-center space-x-2 overflow-x-auto select-none py-0.5 pr-2 scrollbar-none flex-1">
      <!-- "All Stations" Pill -->
      <button
        onclick={() => (selectedStationId = 'all')}
        class="touch-btn shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {
          selectedStationId === 'all'
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm shadow-sky-500/20'
            : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
        }"
      >
        <span>{i18n.t('transit.allStations')}</span>
        <span
          class="px-1.5 py-0.2 rounded-full font-mono text-[10px] {
            selectedStationId === 'all'
              ? 'bg-sky-500/30 text-sky-200'
              : 'bg-slate-800 text-slate-400'
          }"
        >
          {allDepartures.length}
        </span>
      </button>

      <!-- Per-station Pills -->
      {#each stationOptions() as station (station.id)}
        <button
          onclick={() => (selectedStationId = station.id)}
          class="touch-btn shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {
            selectedStationId === station.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm shadow-sky-500/20'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }"
        >
          <span class="truncate max-w-[150px] sm:max-w-[200px]">{station.name}</span>
          <span
            class="px-1.5 py-0.2 rounded-full font-mono text-[10px] {
              selectedStationId === station.id
                ? 'bg-sky-500/30 text-sky-200'
                : 'bg-slate-800 text-slate-400'
            }"
          >
            {station.count}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Departures Columns (Trains & Buses) -->
  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden min-h-0">
    <!-- Left Column: Trains (U-Bahn & S-Bahn) -->
    <div class="glass-card rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <!-- Section Header -->
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 shrink-0">
        <div class="flex items-center space-x-2">
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Icon name="train" size={18} />
          </div>
          <h2 class="text-sm font-bold text-white tracking-wide uppercase">
            {i18n.t('transit.trainsTitle')}
          </h2>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400">
          {i18n.t('transit.departuresCount', { count: filteredTrains().length })}
        </span>
      </div>

      <!-- Departures List -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-1">
        {#if filteredTrains().length > 0}
          {#each filteredTrains() as dep (dep.id)}
            <div
              class="flex items-center justify-between p-2.5 rounded-xl transition-colors {
                dep.isCancelled
                  ? 'bg-red-950/20 border border-red-500/30 opacity-60'
                  : 'bg-slate-900/70 border border-slate-800/80 hover:border-slate-700'
              }"
            >
              <!-- Line badge + Destination + Station -->
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <LinePill line={dep.line} product={dep.product} colors={dep.colors} size="md" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-bold truncate leading-tight {dep.isCancelled ? 'line-through text-slate-400' : 'text-white'}">
                      {dep.destination}
                    </p>
                    {#if dep.isCancelled}
                      <span class="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                        {i18n.t('transit.cancelled')}
                      </span>
                    {/if}
                  </div>
                  <div class="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                    <span class="truncate">{dep.stationName}</span>
                    {#if dep.platform}
                      <span class="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-slate-300">
                        {i18n.t('transit.platform', { platform: dep.platform })}
                      </span>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Delay badge & Countdown -->
              <div class="flex items-center space-x-2 pl-3 text-right shrink-0">
                {#if dep.isRealtime && dep.delayMinutes > 0 && !dep.isCancelled}
                  <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    +{dep.delayMinutes}'
                  </span>
                {/if}
                <div class="flex flex-col items-end {getDepartureColorClass(dep)}">
                  <span class="font-mono text-base leading-tight">{formatDepartureTime(dep)}</span>
                  <span class="font-mono text-[10px] opacity-70 leading-tight">
                    {#if dep.departureInMinutes <= 0}
                      {i18n.t('transit.now')}
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
        {:else}
          <div class="h-full flex items-center justify-center text-slate-500 text-xs">
            {i18n.t('transit.noTrains')}
          </div>
        {/if}
      </div>
    </div>

    <!-- Right Column: Buses & Trams -->
    <div class="glass-card rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <!-- Section Header -->
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 shrink-0">
        <div class="flex items-center space-x-2">
          <div class="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Icon name="bus" size={18} />
          </div>
          <h2 class="text-sm font-bold text-white tracking-wide uppercase">
            {i18n.t('transit.busesTramsTitle')}
          </h2>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400">
          {i18n.t('transit.departuresCount', { count: filteredBusesAndTrams().length })}
        </span>
      </div>

      <!-- Departures List -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-1">
        {#if filteredBusesAndTrams().length > 0}
          {#each filteredBusesAndTrams() as dep (dep.id)}
            <div
              class="flex items-center justify-between p-2.5 rounded-xl transition-colors {
                dep.isCancelled
                  ? 'bg-red-950/20 border border-red-500/30 opacity-60'
                  : 'bg-slate-900/70 border border-slate-800/80 hover:border-slate-700'
              }"
            >
              <!-- Line badge + Destination + Station -->
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <LinePill line={dep.line} product={dep.product} colors={dep.colors} size="md" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-bold truncate leading-tight {dep.isCancelled ? 'line-through text-slate-400' : 'text-white'}">
                      {dep.destination}
                    </p>
                    {#if dep.isCancelled}
                      <span class="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                        {i18n.t('transit.cancelled')}
                      </span>
                    {/if}
                  </div>
                  <div class="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                    <span class="truncate">{dep.stationName}</span>
                  </div>
                </div>
              </div>

              <!-- Delay badge & Countdown -->
              <div class="flex items-center space-x-2 pl-3 text-right shrink-0">
                {#if dep.isRealtime && dep.delayMinutes > 0 && !dep.isCancelled}
                  <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    +{dep.delayMinutes}'
                  </span>
                {/if}
                <div class="flex flex-col items-end {getDepartureColorClass(dep)}">
                  <span class="font-mono text-base leading-tight">{formatDepartureTime(dep)}</span>
                  <span class="font-mono text-[10px] opacity-70 leading-tight">
                    {#if dep.departureInMinutes <= 0}
                      {i18n.t('transit.now')}
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
        {:else}
          <div class="h-full flex items-center justify-center text-slate-500 text-xs">
            {i18n.t('transit.noBuses')}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
