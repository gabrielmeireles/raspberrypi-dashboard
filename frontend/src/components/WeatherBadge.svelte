<script lang="ts">
  import { i18n } from '../lib/i18n/index.svelte.js';
  import type { WeatherAdvisor } from '../types/dashboard.types.js';
  import Icon from './Icon.svelte';

  interface Props {
    advisor: WeatherAdvisor;
    apparentTemp?: number;
    currentTemp?: number;
  }

  let { advisor, apparentTemp = 0, currentTemp = 0 }: Props = $props();

  const localizedAdvisor = $derived(
    i18n.getAdvisorTexts(advisor, currentTemp, apparentTemp)
  );

  const toneClasses = $derived(() => {
    switch (advisor.badgeTone) {
      case 'alert':
        return {
          card: 'bg-red-950/40 border-red-500/30 text-red-200',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          jacketActive: 'bg-red-500/20 text-red-300 border-red-500/40',
          umbrellaActive: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      case 'warning':
        return {
          card: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          jacketActive: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          umbrellaActive: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'info':
        return {
          card: 'bg-sky-950/40 border-sky-500/30 text-sky-200',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          jacketActive: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          umbrellaActive: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'success':
        return {
          card: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          jacketActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          umbrellaActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          card: 'bg-slate-900/60 border-slate-700/60 text-slate-200',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          jacketActive: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          umbrellaActive: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
    }
  });
</script>

<div class="rounded-xl border p-3.5 transition-all {toneClasses().card} flex flex-col justify-between">
  <!-- Top header with badge -->
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center space-x-2">
      <span class="text-xs uppercase font-bold tracking-wider opacity-80">{i18n.t('advisor.clothingAdvice')}</span>
    </div>
    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border {toneClasses().badge}">
      {localizedAdvisor.badgeText}
    </span>
  </div>

  <!-- Headline -->
  <div class="my-2">
    <h3 class="text-base font-bold text-white tracking-tight leading-snug">
      {localizedAdvisor.headline}
    </h3>
    {#if localizedAdvisor.details && localizedAdvisor.details.length > 0}
      <p class="text-xs text-slate-300/90 mt-0.5 line-clamp-1">
        {localizedAdvisor.details[0]}
      </p>
    {/if}
  </div>

  <!-- Status pills: Jacket & Umbrella -->
  <div class="grid grid-cols-2 gap-2 mt-1">
    <!-- Jacket Pill -->
    <div
      class="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors {
        advisor.wearJacket
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 font-semibold'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
      }"
    >
      <Icon
        name="shirt"
        size={16}
        class={advisor.wearJacket ? 'text-amber-400' : 'text-slate-500'}
      />
      <div class="truncate">
        <span>{advisor.wearJacket ? i18n.t('advisor.wearJacket') : i18n.t('advisor.noJacket')}</span>
      </div>
    </div>

    <!-- Umbrella Pill -->
    <div
      class="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors {
        advisor.bringUmbrella
          ? 'bg-sky-500/15 border-sky-500/30 text-sky-200 font-semibold animate-pulse'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
      }"
    >
      <Icon
        name="umbrella"
        size={16}
        class={advisor.bringUmbrella ? 'text-sky-400' : 'text-slate-500'}
      />
      <div class="truncate">
        <span>{advisor.bringUmbrella ? i18n.t('advisor.bringUmbrella') : i18n.t('advisor.noUmbrella')}</span>
      </div>
    </div>
  </div>
</div>
