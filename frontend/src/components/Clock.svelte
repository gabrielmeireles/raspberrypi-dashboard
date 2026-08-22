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
  <div class="flex items-baseline space-x-0.5 font-mono tracking-tight text-white select-none leading-none">
    <span class="text-[2.5rem] font-extrabold tracking-tighter">{hours}</span>
    <span class="text-2xl font-bold text-sky-400/80 animate-pulse">:</span>
    <span class="text-[2.5rem] font-extrabold tracking-tighter">{minutes}</span>
    <span class="text-lg font-semibold text-slate-400 ml-1">{seconds}</span>
  </div>

  <div class="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5 text-slate-300 text-[11px] font-medium leading-tight">
    <span class="text-sky-400 font-semibold">{weekday},</span>
    <span>{dateFormatted}</span>
    <span class="inline-flex items-center space-x-0.5 px-1.5 py-0 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300">
      <Icon name="map-pin" size={10} class="text-sky-400" />
      <span>{city}</span>
    </span>
  </div>
</div>
