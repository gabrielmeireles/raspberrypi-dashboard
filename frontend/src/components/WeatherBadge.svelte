<script lang="ts">
  import { i18n } from '../lib/i18n/index.svelte.js';
  import type { WeatherAdvisor } from '../types/dashboard.types.js';
  import Icon from './Icon.svelte';

  interface Props {
    advisor: WeatherAdvisor;
    apparentTemp?: number;
    currentTemp?: number;
    compact?: boolean;
  }

  let { advisor, apparentTemp = 0, currentTemp = 0, compact = false }: Props = $props();

  const localizedAdvisor = $derived(
    i18n.getAdvisorTexts(advisor, currentTemp, apparentTemp)
  );

  const toneClasses = $derived(() => {
    switch (advisor.badgeTone) {
      case 'alert':
        return {
          card: 'bg-red-950/40 border-red-500/30 text-red-200',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      case 'warning':
        return {
          card: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'info':
        return {
          card: 'bg-sky-950/40 border-sky-500/30 text-sky-200',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'success':
        return {
          card: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          card: 'bg-slate-900/60 border-slate-700/60 text-slate-200',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  });
</script>

<div
  class="rounded-lg border transition-all {toneClasses().card} flex flex-col justify-between {
    compact ? 'p-2 gap-1' : 'p-3.5'
  }"
>
  <div class="flex items-center justify-between gap-2">
    <span class="text-[10px] uppercase font-bold tracking-wider opacity-80">{i18n.t('advisor.clothingAdvice')}</span>
    <span class="px-1.5 py-0 rounded-full text-[10px] font-semibold border {toneClasses().badge}">
      {localizedAdvisor.badgeText}
    </span>
  </div>

  <div class={compact ? 'my-0.5' : 'my-2'}>
    <h3 class="{compact ? 'text-xs' : 'text-base'} font-bold text-white tracking-tight leading-snug line-clamp-1">
      {localizedAdvisor.headline}
    </h3>
    {#if !compact && localizedAdvisor.details && localizedAdvisor.details.length > 0}
      <p class="text-xs text-slate-300/90 mt-0.5 line-clamp-1">
        {localizedAdvisor.details[0]}
      </p>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-1.5">
    <div
      class="flex items-center space-x-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors {
        advisor.wearJacket
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 font-semibold'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
      }"
    >
      <Icon
        name="shirt"
        size={compact ? 12 : 16}
        class={advisor.wearJacket ? 'text-amber-400' : 'text-slate-500'}
      />
      <span class="truncate">{advisor.wearJacket ? i18n.t('advisor.wearJacket') : i18n.t('advisor.noJacket')}</span>
    </div>

    <div
      class="flex items-center space-x-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors {
        advisor.bringUmbrella
          ? 'bg-sky-500/15 border-sky-500/30 text-sky-200 font-semibold animate-pulse'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
      }"
    >
      <Icon
        name="umbrella"
        size={compact ? 12 : 16}
        class={advisor.bringUmbrella ? 'text-sky-400' : 'text-slate-500'}
      />
      <span class="truncate">{advisor.bringUmbrella ? i18n.t('advisor.bringUmbrella') : i18n.t('advisor.noUmbrella')}</span>
    </div>
  </div>
</div>
