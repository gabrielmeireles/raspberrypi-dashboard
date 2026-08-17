<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { i18n, LOCALES } from '../lib/i18n/index.svelte.js';
  import type { SupportedLocale } from '../lib/i18n/types.js';
  import Icon from './Icon.svelte';

  let isOpen = $state(false);
  let menuRef: HTMLDivElement | null = null;

  function toggle() {
    isOpen = !isOpen;
  }

  function selectLanguage(locale: SupportedLocale) {
    i18n.setLocale(locale);
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent | TouchEvent) {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('pointerdown', handleClickOutside);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', handleClickOutside);
    }
  });
</script>

<div class="relative" bind:this={menuRef}>
  <!-- Language Trigger Button -->
  <button
    onclick={toggle}
    title={i18n.t('nav.changeLanguage')}
    aria-label={i18n.t('nav.changeLanguage')}
    aria-expanded={isOpen}
    class="touch-btn flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-semibold select-none {
      isOpen
        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20'
        : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600 hover:bg-slate-800'
    }"
  >
    <span class="text-sm">{i18n.activeLocaleInfo.flag}</span>
    <span class="uppercase tracking-wider font-mono text-[11px]">{i18n.locale}</span>
    <Icon
      name={isOpen ? 'chevron-down' : 'chevron-up'}
      size={14}
      class="text-slate-400 transition-transform duration-200"
    />
  </button>

  <!-- Language Dropdown Menu (Opens Above the Bottom Bar) -->
  {#if isOpen}
    <div
      class="absolute bottom-full right-0 mb-3 w-52 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-xl p-2 z-50 flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
        <span>{i18n.t('nav.language')}</span>
        <Icon name="globe" size={13} class="text-sky-400" />
      </div>

      {#each LOCALES as loc}
        <button
          onclick={() => selectLanguage(loc.code)}
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all {
            i18n.locale === loc.code
              ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 font-semibold'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
          }"
        >
          <div class="flex items-center space-x-2.5">
            <span class="text-base">{loc.flag}</span>
            <div>
              <div class="leading-tight text-white">{loc.nativeName}</div>
              <div class="text-[10px] text-slate-400">{loc.name}</div>
            </div>
          </div>

          {#if i18n.locale === loc.code}
            <div class="w-5 h-5 rounded-full bg-sky-500/30 text-sky-300 flex items-center justify-center">
              <Icon name="check" size={13} />
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
