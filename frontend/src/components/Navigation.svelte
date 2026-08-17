<script lang="ts">
  import { i18n } from '../lib/i18n/index.svelte.js';
  import { store } from '../lib/store.svelte.js';
  import type { ActiveTab } from '../types/dashboard.types.js';
  import Icon from './Icon.svelte';
  import LanguageMenu from './LanguageMenu.svelte';

  const tabs = $derived<Array<{ id: ActiveTab; label: string; icon: string }>>([
    { id: 'home', label: i18n.t('nav.home'), icon: 'clock' },
    { id: 'weather', label: i18n.t('nav.weather'), icon: 'sun' },
    { id: 'transit', label: i18n.t('nav.transit'), icon: 'train' },
  ]);

  const lastUpdatedFormatted = $derived(() => {
    const d = store.lastUpdated.transit || store.lastUpdated.weather;
    if (!d) return '--:--';
    return i18n.formatTime(d, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
</script>

<nav class="h-16 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
  <!-- Tab navigation items -->
  <div class="flex items-center space-x-2">
    {#each tabs as tab}
      <button
        onclick={() => store.setTab(tab.id)}
        class="touch-btn relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all {
          store.activeTab === tab.id
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
        }"
      >
        <Icon
          name={tab.icon}
          size={18}
          class={store.activeTab === tab.id ? 'text-sky-400' : 'text-slate-400'}
        />
        <span>{tab.label}</span>
        {#if store.activeTab === tab.id}
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sky-400 rounded-full"></div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Right side: Last updated, Language switcher, and manual refresh button -->
  <div class="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-400">
    <div class="hidden md:flex items-center space-x-1.5 font-mono">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span>{i18n.t('nav.lastUpdated', { time: lastUpdatedFormatted() })}</span>
    </div>

    <!-- Language Selector Menu -->
    <LanguageMenu />

    <!-- Manual refresh button with large touch padding -->
    <button
      onclick={() => store.refreshAll()}
      disabled={store.isRefreshing}
      title={i18n.t('nav.refreshTitle')}
      aria-label={i18n.t('nav.refresh')}
      class="touch-btn flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 active:scale-95 disabled:opacity-50"
    >
      <Icon
        name="refresh"
        size={18}
        class={store.isRefreshing ? 'animate-spin text-sky-400' : 'text-slate-300'}
      />
    </button>
  </div>
</nav>
