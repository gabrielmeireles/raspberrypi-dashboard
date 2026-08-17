<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { i18n } from '../lib/i18n/index.svelte.js';
  import Icon from './Icon.svelte';

  interface Props {
    city?: string;
  }

  let { city = 'München' }: Props = $props();

  let now = $state(new Date());
  let timer: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    timer = setInterval(() => {
      now = new Date();
    }, 1000);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  const hours = $derived(now.getHours().toString().padStart(2, '0'));
  const minutes = $derived(now.getMinutes().toString().padStart(2, '0'));
  const seconds = $derived(now.getSeconds().toString().padStart(2, '0'));

  const weekday = $derived(
    i18n.formatWeekday(now, 'long')
  );
  const dateFormatted = $derived(
    i18n.formatDate(now, { day: 'numeric', month: 'long', year: 'numeric' })
  );
</script>

<div class="flex flex-col justify-center">
  <!-- Time display -->
  <div class="flex items-baseline space-x-1 font-mono tracking-tight text-white select-none">
    <span class="text-5xl sm:text-6xl font-extrabold tracking-tighter drop-shadow-sm">{hours}</span>
    <span class="text-4xl sm:5xl font-bold text-sky-400/80 animate-pulse">:</span>
    <span class="text-5xl sm:text-6xl font-extrabold tracking-tighter drop-shadow-sm">{minutes}</span>
    <span class="text-2xl sm:text-3xl font-semibold text-slate-400 ml-1.5">{seconds}</span>
  </div>

  <!-- Date & Location -->
  <div class="flex items-center space-x-2 mt-1 text-slate-300 text-sm sm:text-base font-medium">
    <span class="text-sky-400 font-semibold">{weekday},</span>
    <span>{dateFormatted}</span>
    <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
      <Icon name="map-pin" size={12} class="text-sky-400" />
      <span>{city}</span>
    </span>
  </div>
</div>
