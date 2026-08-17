<script lang="ts">
  interface Props {
    name: string;
    size?: number | string;
    class?: string;
    strokeWidth?: number;
  }

  let { name, size = 20, class: className = '', strokeWidth = 2 }: Props = $props();

  const px = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={px}
  height={px}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  {#if name === 'sun'}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  {:else if name === 'moon'}
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  {:else if name === 'cloud'}
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  {:else if name === 'cloud-sun'}
    <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" />
    <path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
    <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
  {:else if name === 'cloud-moon'}
    <path d="M10.188 8.5A6 6 0 0 1 16 4a6 6 0 0 0-6 6c0 1.25.38 2.4 1.03 3.35" />
    <path d="M17 18a5 5 0 0 0-10 0" />
    <path d="M17 22H7a5 5 0 1 1 4.9-6H17a3 3 0 0 1 0 6Z" />
  {:else if name === 'cloud-rain'}
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" />
  {:else if name === 'cloud-rain-heavy'}
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="m16 14-2 6" /><path d="m8 14-2 6" /><path d="m12 14-2 6" />
  {:else if name === 'cloud-drizzle'}
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M8 19v1" /><path d="M8 14v1" /><path d="M12 21v1" /><path d="M12 16v1" /><path d="M16 19v1" /><path d="M16 14v1" />
  {:else if name === 'cloud-lightning'}
    <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
    <path d="m13 12-3 5h4l-3 5" />
  {:else if name === 'cloud-fog' || name === 'fog'}
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M16 17H7" /><path d="M17 21H9" />
  {:else if name === 'snowflake' || name === 'cloud-snow'}
    <path d="m10 20-1.25-2.5L6 18" /><path d="M10 4 8.75 6.5 6 6" />
    <path d="m14 20 1.25-2.5L18 18" /><path d="m14 4 1.25 2.5L18 6" />
    <path d="m17 21-3-6h-4l-3 6" /><path d="m17 3-3 6h-4L7 3" />
    <path d="M2 12h20" /><path d="M20 10l-2.5 1.25L18 14" /><path d="M4 10l2.5 1.25L6 14" />
  {:else if name === 'umbrella'}
    <path d="M22 12a10.06 10.06 10.06 0 0 0-20 0Z" />
    <path d="M12 12v8a2 2 0 0 0 4 0" />
    <path d="M12 2v1" />
  {:else if name === 'shirt' || name === 'jacket'}
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  {:else if name === 'train'}
    <rect width="16" height="16" x="4" y="3" rx="2" />
    <path d="M4 11h16" /><path d="M12 3v8" />
    <path d="m8 19-2 3" /><path d="m18 22-2-3" />
    <circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" />
  {:else if name === 'bus'}
    <path d="M8 6v6" /><path d="M16 6v6" />
    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    <path d="M4 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" /><path d="M17 18v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
    <circle cx="6" cy="14" r="1" /><circle cx="18" cy="14" r="1" />
  {:else if name === 'tram'}
    <rect width="16" height="16" x="4" y="3" rx="2" />
    <path d="M4 11h16" />
    <path d="m9 3-2-2h10l-2 2" />
    <circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" />
  {:else if name === 'droplet'}
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  {:else if name === 'wind'}
    <path d="M17.7 7.7A2.5 2.5 0 1 1 19 12H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  {:else if name === 'refresh'}
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  {:else if name === 'map-pin'}
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  {:else if name === 'alert' || name === 'alert-circle'}
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
  {:else if name === 'check'}
    <polyline points="20 6 9 17 4 12" />
  {:else if name === 'globe'}
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  {:else if name === 'languages'}
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  {:else if name === 'chevron-up'}
    <path d="m18 15-6-6-6 6" />
  {:else if name === 'chevron-down'}
    <path d="m6 9 6 6 6-6" />
  {:else if name === 'sunrise'}
    <path d="M12 2v6" /><path d="m4.93 10.93 1.41 1.41" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" />
    <path d="M22 22H2" /><path d="m8 6 4-4 4 4" /><path d="M16 18a4 4 0 0 0-8 0" />
  {:else if name === 'sunset'}
    <path d="M12 10V4" /><path d="m4.93 10.93 1.41 1.41" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" />
    <path d="M22 22H2" /><path d="m16 8-4 4-4-4" /><path d="M16 18a4 4 0 0 0-8 0" />
  {:else}
    <!-- fallback circle -->
    <circle cx="12" cy="12" r="10" />
  {/if}
</svg>
