<script lang="ts">
  import type { TransportProduct } from '../types/dashboard.types.js';
  import Icon from './Icon.svelte';

  interface Props {
    line: string;
    product?: TransportProduct;
    colors?: {
      bg: string;
      text: string;
      border?: string;
    };
    size?: 'sm' | 'md' | 'lg';
  }

  let { line, product = 'BUS', colors, size = 'md' }: Props = $props();

  const iconName = $derived(() => {
    if (product === 'U_BAHN' || product === 'S_BAHN') return 'train';
    if (product === 'TRAM') return 'tram';
    return 'bus';
  });

  const sizeClasses = $derived(() => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs font-bold min-w-[2.25rem]';
      case 'lg':
        return 'px-3 py-1.5 text-base font-extrabold min-w-[3.5rem]';
      default:
        return 'px-2 py-0.5 text-sm font-bold min-w-[2.75rem]';
    }
  });

  const bgStyle = $derived(() => {
    if (colors?.bg) {
      return `background-color: ${colors.bg}; color: ${colors.text || '#ffffff'}; ${
        colors.border ? `border: 2px solid ${colors.border};` : ''
      }`;
    }
    return '';
  });
</script>

<div
  class="inline-flex items-center justify-center rounded-md shadow-sm font-mono tracking-tight shrink-0 transition-transform {sizeClasses()}"
  style={bgStyle()}
>
  <span class="truncate">{line}</span>
</div>
