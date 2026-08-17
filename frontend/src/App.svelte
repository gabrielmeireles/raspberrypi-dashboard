<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from './components/Navigation.svelte';
  import HomeView from './components/views/HomeView.svelte';
  import TransitView from './components/views/TransitView.svelte';
  import WeatherView from './components/views/WeatherView.svelte';
  import { i18n } from './lib/i18n/index.svelte.js';
  import { store } from './lib/store.svelte.js';

  onMount(() => {
    store.init();
  });
</script>

<main class="h-screen w-screen flex flex-col bg-background text-slate-100 overflow-hidden select-none font-sans">
  <!-- Error notice if any -->
  {#if store.errors.weather || store.errors.transit}
    <div class="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1 text-xs text-amber-200 flex items-center justify-between z-40 shrink-0">
      <div class="flex items-center space-x-2 truncate">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span class="truncate">
          {store.errors.weather || store.errors.transit}
        </span>
      </div>
      <button
        onclick={() => store.refreshAll()}
        class="text-[11px] underline font-semibold ml-2 hover:text-white shrink-0"
      >
        {i18n.t('common.retry')}
      </button>
    </div>
  {/if}

  <!-- Active View Area -->
  <div class="flex-1 w-full overflow-hidden relative">
    {#if store.activeTab === 'home'}
      <HomeView />
    {:else if store.activeTab === 'weather'}
      <WeatherView />
    {:else if store.activeTab === 'transit'}
      <TransitView />
    {/if}
  </div>

  <!-- Bottom Navigation Bar -->
  <Navigation />
</main>
